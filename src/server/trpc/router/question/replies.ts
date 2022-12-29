import { TRPCClientError } from "@trpc/client";
import { publicProcedure } from "./../../trpc";
import { db } from "@utils/firebase";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore/lite";
import { z } from "zod";

import { router, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";
import type { ReplyData, ReplyResult } from "@types-local/defined-types";
import { timestampToNumber } from "@utils/index";

export const questionReplyRouter = router({
  read: publicProcedure
    .input(z.object({ parentUid: z.string(), questionId: z.string() }))
    .query(async ({ input }) => {
      const { parentUid, questionId } = input;

      const repliesColl = collection(
        db,
        "users",
        parentUid,
        "questions",
        questionId,
        "replies"
      );
      const repliesSnap = await getDocs(repliesColl);

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
        const questionReplyColl = collection(
          db,
          "users",
          parentUid,
          "questions",
          questionId,
          "replies"
        );

        const replyResult = {
          reply,
          uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          displayName,
          username,
          questionId,
          questionUid: parentUid,
        };

        const response = await addDoc(questionReplyColl, replyResult);

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

      const questionReplyRef = doc(
        db,
        "users",
        parentUid,
        "questions",
        questionId,
        "replies",
        replyId
      );

      await updateDoc(questionReplyRef, {
        reply,
        updatedAt: serverTimestamp(),
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

      const questionReplyRef = doc(
        db,
        "users",
        parentUid,
        "questions",
        questionId,
        "replies",
        replyId
      );

      await deleteDoc(questionReplyRef);
    }),
});
