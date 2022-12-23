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

import { router, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const questionReplyRouter = router({
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
        const result = await addDoc(questionReplyColl, {
          reply,
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
