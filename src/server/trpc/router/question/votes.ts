import { TRPCClientError } from "@trpc/client";
import { publicProcedure, router, protectedProcedure } from "@server/trpc/trpc";
import { z } from "zod";

import { TRPCError } from "@trpc/server";
import {
  questionDoc,
  questionDownvoteDoc,
  questionDownvotesColl,
  questionUpvoteDoc,
  questionUpvotesColl,
  userDoc,
  writeBatch,
} from "@utils/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export const questionLikesRouter = router({
  read: publicProcedure
    .input(z.object({ uid: z.string(), questionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { uid, questionId } = input;
      const sessionUid = ctx.session?.uid;

      const upvotes = (
        await questionUpvotesColl(uid, questionId).count().get()
      ).data().count;
      const downvotes = (
        await questionDownvotesColl(uid, questionId).count().get()
      ).data().count;

      const upvote = sessionUid
        ? (await questionUpvoteDoc(uid, questionId, sessionUid).get()).exists
        : false;

      const downvote = sessionUid
        ? (await questionDownvoteDoc(uid, questionId, sessionUid).get()).exists
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
        const upvoteRef = questionUpvoteDoc(parentUid, questionId, uid);
        const downvoteRef = questionDownvoteDoc(parentUid, questionId, uid);
        const upvoteSnap = await upvoteRef.get();
        const downvoteSnap = await downvoteRef.get();

        const questionRef = questionDoc(parentUid, questionId);

        const batch = writeBatch();

        if (downvoteSnap.exists) {
          console.log("downvoteSnap: ", downvoteSnap.exists);
          batch.delete(downvoteRef);
          batch.set(upvoteRef, {
            uid,
            user: userDoc(uid),
          });
          batch.update(questionRef, {
            likes: FieldValue.increment(2),
          });
          await batch.commit();

          return {
            downvote: false,
            upvote: true,
            likesInc: 2,
          };
        } else if (upvoteSnap.exists) {
          batch.delete(upvoteRef);
          batch.update(questionRef, {
            likes: FieldValue.increment(-1),
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
            user: userDoc(uid),
          });
          batch.update(questionRef, {
            likes: FieldValue.increment(1),
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
        const upvoteRef = questionUpvoteDoc(parentUid, questionId, uid);
        const downvoteRef = questionDownvoteDoc(parentUid, questionId, uid);
        const upvoteSnap = await upvoteRef.get();
        const downvoteSnap = await downvoteRef.get();

        const questionRef = questionDoc(parentUid, questionId);

        const batch = writeBatch();

        if (upvoteSnap.exists) {
          batch.delete(upvoteRef);
          batch.set(downvoteRef, {
            uid,
            user: userDoc(uid),
          });
          batch.update(questionRef, {
            likes: FieldValue.increment(-2),
          });
          await batch.commit();

          return {
            downvote: true,
            upvote: false,
            likesInc: -2,
          };
        } else if (downvoteSnap.exists) {
          batch.delete(downvoteRef);
          batch.update(questionRef, {
            likes: FieldValue.increment(1),
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
            user: userDoc(uid),
          });
          batch.update(questionRef, {
            likes: FieldValue.increment(-1),
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
