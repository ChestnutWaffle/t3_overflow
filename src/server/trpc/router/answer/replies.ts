import { db } from "@utils/firebase";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
} from "firebase/firestore/lite";
import { z } from "zod";

import { router, protectedProcedure } from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";

export const answerReplyRouter = router({
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
        const answerReplyColl = collection(
          db,
          "users",
          parentUid,
          "questions",
          questionId,
          "answers",
          answerId,
          "replies"
        );
        const result = await addDoc(answerReplyColl, {
          reply,
          user: doc(db, "users", uid),
          uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),

          displayName,
          username,
        });

        return {
          code: 1,
          message: "Replied successfully.",
          data: result.id,
        };
      } catch (e) {
        return {
          code: -1,
          message: "Failed to Reply.",
        };
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

      const answerReplyRef = doc(
        db,
        "users",
        parentUid,
        "questions",
        questionId,
        "answers",
        answerId,
        "replies",
        replyId
      );

      await updateDoc(answerReplyRef, {
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

      const answerReplyRef = doc(
        db,
        "users",
        parentUid,
        "questions",
        questionId,
        "answers",
        answerId,
        "replies",
        replyId
      );

      await deleteDoc(answerReplyRef);
    }),
});
