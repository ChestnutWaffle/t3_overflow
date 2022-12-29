import { TRPCClientError } from "@trpc/client";
import { publicProcedure } from "@server/trpc/trpc";
import { db } from "@utils/firebase";
import {
  writeBatch,
  doc,
  getDoc,
  increment,
  collection,
} from "firebase/firestore/lite";
import { getCount } from "firebase/firestore/lite";
import { z } from "zod";

import { router, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const questionLikesRouter = router({
  read: publicProcedure
    .input(z.object({ uid: z.string(), questionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { uid, questionId } = input;
      const sessionUid = ctx.session?.uid;

      const upvoteColl = collection(
        db,
        "users",
        uid,
        "questions",
        questionId,
        "upvotes"
      );
      const downvoteColl = collection(
        db,
        "users",
        uid,
        "questions",
        questionId,
        "downvotes"
      );

      const upvotes = (await getCount(upvoteColl)).data().count;
      const downvotes = (await getCount(downvoteColl)).data().count;

      const upvote = sessionUid
        ? (
            await getDoc(
              doc(
                db,
                "users",
                uid,
                "questions",
                questionId,
                "upvotes",
                sessionUid
              )
            )
          ).exists()
        : false;

      const downvote = sessionUid
        ? (
            await getDoc(
              doc(
                db,
                "users",
                uid,
                "questions",
                questionId,
                "downvotes",
                sessionUid
              )
            )
          ).exists()
        : false;

      return {
        likes: upvotes - downvotes,
        upvote,
        downvote,
      };
    }),

  upvote: protectedProcedure
    .input(
      z.object({
        uid: z.string(),
        parentUid: z.string(),
        questionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { uid, parentUid, questionId } = input;
      const sessionUid = ctx.session?.uid;
      if (uid !== sessionUid || !ctx.session?.email_verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Action",
        });
      }

      try {
        const upvoteRef = doc(
          db,
          "users",
          parentUid,
          "questions",
          questionId,
          "upvotes",
          uid
        );
        const downvoteRef = doc(
          db,
          "users",
          parentUid,
          "questions",
          questionId,
          "downvotes",
          uid
        );
        const upvoteDoc = await getDoc(upvoteRef);
        const downvoteDoc = await getDoc(downvoteRef);

        const batch = writeBatch(db);

        if (downvoteDoc.exists()) {
          batch.delete(downvoteRef);
          batch.set(upvoteRef, {
            uid,
            user: doc(db, "users", uid),
          });
          batch.update(doc(db, "users", parentUid, "questions", questionId), {
            likes: increment(2),
          });
          await batch.commit();

          return {
            downvote: false,
            upvote: true,
            likesInc: 2,
          };
        } else if (upvoteDoc.exists()) {
          batch.delete(upvoteRef);
          batch.update(doc(db, "users", parentUid, "questions", questionId), {
            likes: increment(-1),
          });
          await batch.commit();
          return {
            downvote: false,
            upvote: false,
            likesInc: -1,
          };
        } else {
          batch.set(upvoteRef, {
            uid,
            user: doc(db, "users", uid),
          });
          batch.update(doc(db, "users", parentUid, "questions", questionId), {
            likes: increment(1),
          });
          await batch.commit();
          return {
            downvote: false,
            upvote: true,
            likesInc: 1,
          };
        }
      } catch (e) {
        throw new TRPCClientError("Failed to upvote");
      }
    }),

  downvote: protectedProcedure
    .input(
      z.object({
        uid: z.string(),
        parentUid: z.string(),
        questionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { uid, parentUid, questionId } = input;
      const sessionUid = ctx.session?.uid;
      if (uid !== sessionUid || !ctx.session?.email_verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Action",
        });
      }

      try {
        const upvoteRef = doc(
          db,
          "users",
          parentUid,
          "questions",
          questionId,
          "upvotes",
          uid
        );
        const downvoteRef = doc(
          db,
          "users",
          parentUid,
          "questions",
          questionId,
          "downvotes",
          uid
        );
        const downvoteDoc = await getDoc(downvoteRef);
        const upvoteDoc = await getDoc(upvoteRef);

        const batch = writeBatch(db);

        if (upvoteDoc.exists()) {
          batch.delete(upvoteRef);
          batch.set(downvoteRef, {
            uid,
            user: doc(db, "users", uid),
          });
          batch.update(doc(db, "users", parentUid, "questions", questionId), {
            likes: increment(-2),
          });
          await batch.commit();

          return {
            downvote: true,
            upvote: false,
            likesInc: -2,
          };
        } else if (downvoteDoc.exists()) {
          batch.delete(downvoteRef);
          batch.update(doc(db, "users", parentUid, "questions", questionId), {
            likes: increment(1),
          });
          await batch.commit();
          return {
            downvote: false,
            upvote: false,
            likesInc: 1,
          };
        } else {
          batch.set(downvoteRef, {
            uid,
            user: doc(db, "users", uid),
          });
          batch.update(doc(db, "users", parentUid, "questions", questionId), {
            likes: increment(-1),
          });
          await batch.commit();

          return {
            downvote: true,
            upvote: false,
            likesInc: -1,
          };
        }
      } catch (e) {
        throw new TRPCClientError("Failed to downvote");
      }
    }),
});
