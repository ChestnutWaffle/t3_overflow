import { db } from "@utils/firebase";
import { writeBatch, doc, getDoc, increment } from "firebase/firestore/lite";
import { z } from "zod";

import { router, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const answerLikesRouter = router({
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
        const upvoteRef = doc(
          db,
          "users",
          parentUid,
          "questions",
          questionId,
          "answers",
          answerId,
          "upvotes",
          uid
        );
        const downvoteRef = doc(
          db,
          "users",
          parentUid,
          "questions",
          questionId,
          "answers",
          answerId,
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
          batch.update(
            doc(
              db,
              "users",
              parentUid,
              "questions",
              questionId,
              "answers",
              answerId
            ),
            {
              likes: increment(2),
            }
          );
          await batch.commit();

          return {
            code: 1,
            data: {
              downvote: false,
              upvote: true,
            },
          };
        } else if (upvoteDoc.exists()) {
          batch.delete(upvoteRef);
          batch.update(
            doc(
              db,
              "users",
              parentUid,
              "questions",
              questionId,
              "answers",
              answerId
            ),
            {
              likes: increment(-1),
            }
          );
          await batch.commit();
          return {
            code: 1,
            data: {
              downvote: false,
              upvote: false,
            },
          };
        } else {
          batch.set(upvoteRef, {
            uid,
            user: doc(db, "users", uid),
          });
          batch.update(
            doc(
              db,
              "users",
              parentUid,
              "questions",
              questionId,
              "answers",
              answerId
            ),
            {
              likes: increment(1),
            }
          );
          await batch.commit();

          return {
            code: 1,
            data: {
              downvote: false,
              upvote: true,
            },
          };
        }
      } catch (e) {
        return {
          code: -1,
          message: "Failed to Vote.",
        };
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
        const upvoteRef = doc(
          db,
          "users",
          parentUid,
          "questions",
          questionId,
          "answers",
          answerId,
          "upvotes",
          uid
        );
        const downvoteRef = doc(
          db,
          "users",
          parentUid,
          "questions",
          questionId,
          "answers",
          answerId,
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
          batch.update(
            doc(
              db,
              "users",
              parentUid,
              "questions",
              questionId,
              "answers",
              answerId
            ),
            {
              likes: increment(-2),
            }
          );
          await batch.commit();

          return {
            code: 1,
            data: {
              downvote: true,
              upvote: false,
            },
          };
        } else if (downvoteDoc.exists()) {
          batch.delete(downvoteRef);
          batch.update(
            doc(
              db,
              "users",
              parentUid,
              "questions",
              questionId,
              "answers",
              answerId
            ),
            {
              likes: increment(1),
            }
          );
          await batch.commit();
          return {
            code: 1,
            data: {
              downvote: false,
              upvote: false,
            },
          };
        } else {
          batch.set(downvoteRef, {
            uid,
            user: doc(db, "users", uid),
          });
          batch.update(
            doc(
              db,
              "users",
              parentUid,
              "questions",
              questionId,
              "answers",
              answerId
            ),
            {
              likes: increment(-1),
            }
          );
          await batch.commit();

          return {
            code: 1,
            data: {
              downvote: true,
              upvote: false,
            },
          };
        }
      } catch (e) {
        return {
          code: -1,
          message: "Failed to Vote.",
        };
      }
    }),
});
