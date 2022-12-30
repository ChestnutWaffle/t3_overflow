import { TRPCClientError } from "@trpc/client";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";
import {
  answerDoc,
  answerDownvoteDoc,
  answerDownvotesColl,
  answerUpvoteDoc,
  answerUpvotesColl,
  userDoc,
  writeBatch,
} from "@utils/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export const answerLikesRouter = router({
  read: publicProcedure
    .input(
      z.object({
        uid: z.string(),
        questionId: z.string(),
        answerId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { uid, questionId, answerId } = input;
      const sessionUid = ctx.session?.uid;

      const upvoteColl = answerUpvotesColl(uid, questionId, answerId);
      const downvoteColl = answerDownvotesColl(uid, questionId, answerId);

      const upvotes = (await upvoteColl.count().get()).data().count;
      const downvotes = (await downvoteColl.count().get()).data().count;

      const upvote = sessionUid
        ? (await answerUpvoteDoc(uid, questionId, answerId, sessionUid).get())
            .exists
        : false;

      const downvote = sessionUid
        ? (await answerDownvoteDoc(uid, questionId, answerId, sessionUid).get())
            .exists
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
        answerId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { uid, parentUid, questionId, answerId } = input;
      const sessionUid = ctx.session?.uid;
      if (uid !== sessionUid || !ctx.session?.email_verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Action",
        });
      }

      try {
        const upvoteRef = answerUpvoteDoc(parentUid, questionId, answerId, uid);
        const downvoteRef = answerDownvoteDoc(
          parentUid,
          questionId,
          answerId,
          uid
        );

        const answerRef = answerDoc(parentUid, questionId, answerId);

        const upvoteDoc = await upvoteRef.get();
        const downvoteDoc = await downvoteRef.get();

        const batch = writeBatch();

        if (downvoteDoc.exists) {
          batch.delete(downvoteRef);
          batch.set(upvoteRef, {
            uid,
            user: userDoc(uid),
          });
          batch.update(answerRef, {
            likes: FieldValue.increment(2),
          });
          await batch.commit();

          return {
            downvote: false,
            upvote: true,
            likesInc: 2,
          };
        } else if (upvoteDoc.exists) {
          batch.delete(upvoteRef);
          batch.update(answerRef, {
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
          batch.update(answerRef, {
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
        answerId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { uid, parentUid, questionId, answerId } = input;
      const sessionUid = ctx.session?.uid;
      if (uid !== sessionUid || !ctx.session?.email_verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Action",
        });
      }

      try {
        const upvoteRef = answerUpvoteDoc(parentUid, questionId, answerId, uid);
        const downvoteRef = answerDownvoteDoc(
          parentUid,
          questionId,
          answerId,
          uid
        );

        const answerRef = answerDoc(parentUid, questionId, answerId);

        const upvoteDoc = await upvoteRef.get();
        const downvoteDoc = await downvoteRef.get();

        const batch = writeBatch();

        if (upvoteDoc.exists) {
          batch.delete(upvoteRef);
          batch.set(downvoteRef, {
            uid,
            user: userDoc(uid),
          });
          batch.update(answerRef, {
            likes: FieldValue.increment(-2),
          });
          await batch.commit();

          return {
            downvote: true,
            upvote: false,
            likesInc: -2,
          };
        } else if (downvoteDoc.exists) {
          batch.delete(downvoteRef);
          batch.update(answerRef, {
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
          batch.update(answerRef, {
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
