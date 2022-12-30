import { TRPCClientError } from "@trpc/client";
import { publicProcedure, router, protectedProcedure } from "@server/trpc/trpc";
import { z } from "zod";

import { TRPCError } from "@trpc/server";
import type { ReplyResult } from "@types-local/defined-types";
import { timestampToNumber } from "@utils/index";
import { questionReplyColl, questionReplyDoc } from "@utils/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

type ReplyData = {
  reply: string;
  uid: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  displayName: string;
  username: string;
};

export const questionReplyRouter = router({
  read: publicProcedure
    .input(z.object({ parentUid: z.string(), questionId: z.string() }))
    .query(async ({ input }) => {
      const { parentUid, questionId } = input;

      const repliesSnap = await questionReplyColl(parentUid, questionId).get();

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
        displayName: z.string(),
        username: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { reply, uid, parentUid, questionId, displayName, username } =
        input;
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
          questionId,
          questionUid: parentUid,
        };

        const response = await questionReplyColl(parentUid, questionId).add(
          replyResult
        );

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
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { uid, questionId, parentUid, reply, replyId } = input;

      const sessionUid = ctx.session?.uid;
      if (uid !== sessionUid || !ctx.session?.email_verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Action",
        });
      }

      const questionReplyRef = questionReplyDoc(parentUid, questionId, replyId);

      await questionReplyRef.update({
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { uid, questionId, parentUid, replyId } = input;
      const sessionUid = ctx.session?.uid;
      if (uid !== sessionUid || !ctx.session?.email_verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Action",
        });
      }

      const questionReplyRef = questionReplyDoc(parentUid, questionId, replyId);

      await questionReplyRef.delete();
    }),
});
