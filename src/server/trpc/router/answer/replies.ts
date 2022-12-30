import { TRPCClientError } from "@trpc/client";
import type { ReplyResult } from "@types-local/defined-types";
import { publicProcedure, router, protectedProcedure } from "@server/trpc/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { timestampToNumber } from "@utils/index";
import { answerReplyColl, answerReplyDoc } from "@utils/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

type ReplyData = {
  reply: string;
  uid: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  displayName: string;
  username: string;
};

export const answerReplyRouter = router({
  read: publicProcedure
    .input(
      z.object({
        parentUid: z.string(),
        questionId: z.string(),
        answerId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { parentUid, questionId, answerId } = input;

      const repliesSnap = await answerReplyColl(
        parentUid,
        questionId,
        answerId
      ).get();

      const replies: ReplyResult[] = [];

      repliesSnap.forEach((reply) => {
        const data = reply.data() as ReplyData;

        replies.push({
          id: reply.id,
          ...data,
          createdAt: timestampToNumber(data.createdAt),
          updatedAt: timestampToNumber(data.updatedAt),
        });
      });

      return { replies };
    }),

  create: protectedProcedure
    .input(
      z.object({
        uid: z.string(),
        reply: z.string().min(10, "Reply too short.").max(200, "Reply too big"),
        parentUid: z.string(),
        questionId: z.string(),
        answerId: z.string(),
        displayName: z.string(),
        username: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        reply,
        uid,
        parentUid,
        questionId,
        answerId,
        displayName,
        username,
      } = input;
      const sessionUid = ctx.session?.uid;
      if (uid !== sessionUid || !ctx.session?.email_verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Action",
        });
      }

      try {
        const replyResult = {
          reply,
          uid,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          displayName,
          username,
          answerId,
          questionId,
          questionUid: parentUid,
        };

        const response = await answerReplyColl(
          parentUid,
          questionId,
          answerId
        ).add(replyResult);

        return {
          id: response.id,
          ...replyResult,
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
        };
      } catch (e) {
        throw new TRPCClientError("Failed to reply");
      }
    }),

  edit: protectedProcedure
    .input(
      z.object({
        uid: z.string(),
        reply: z.string().min(10, "Reply too short.").max(200, "Reply too big"),
        parentUid: z.string(),
        questionId: z.string(),
        replyId: z.string(),
        answerId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { uid, questionId, parentUid, reply, replyId, answerId } = input;

      const sessionUid = ctx.session?.uid;
      if (uid !== sessionUid || !ctx.session?.email_verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Action",
        });
      }

      await answerReplyDoc(parentUid, questionId, answerId, replyId).update({
        reply,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        uid: z.string(),
        parentUid: z.string(),
        questionId: z.string(),
        replyId: z.string(),
        answerId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { uid, questionId, parentUid, replyId, answerId } = input;
      const sessionUid = ctx.session?.uid;
      if (uid !== sessionUid || !ctx.session?.email_verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Action",
        });
      }

      const answerReplyRef = answerReplyDoc(
        parentUid,
        questionId,
        answerId,
        replyId
      );

      await answerReplyRef.delete();
    }),
});
