import { answerReplyRouter } from "./replies";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@server/trpc/trpc";
import { timestampToNumber } from "@utils/index";
import type { AnswerResult, AnswerData } from "@types-local/defined-types";
import { answerLikesRouter } from "./votes";
import {
  answerColl,
  answerDoc,
  answerDownvoteDoc,
  answerUpvoteDoc,
} from "@utils/firebase/admin";
import { getUserData } from "@utils/firebase/admin/docdata";
import { FieldValue } from "firebase-admin/firestore";

export const answerRouter = router({
  read: publicProcedure
    .input(
      z.object({
        questionId: z.string(),
        uid: z.string(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { questionId, uid } = input;
      const cursor = input.cursor as string | undefined;
      const sessionUid = ctx.session?.uid;

      const nthDoc = cursor
        ? await answerDoc(uid, questionId, cursor).get()
        : undefined;

      const LIMIT = 1;

      try {
        const q = !nthDoc
          ? answerColl(uid, questionId).orderBy("likes", "desc").limit(LIMIT)
          : answerColl(uid, questionId)
              .orderBy("likes", "desc")
              .startAfter(nthDoc)
              .limit(LIMIT);
        const querySnap = await q.get();
        const result: AnswerResult[] = [];

        for (let i = 0; i < querySnap.docs.length; i++) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const document = querySnap.docs[i]!;
          const data = document.data() as AnswerData;
          const userData = await getUserData(data.uid);

          if (!userData) continue;

          const upvote = sessionUid
            ? (
                await answerUpvoteDoc(
                  uid,
                  questionId,
                  document.id,
                  sessionUid
                ).get()
              ).exists
            : false;

          const downvote = sessionUid
            ? (
                await answerDownvoteDoc(
                  uid,
                  questionId,
                  document.id,
                  sessionUid
                ).get()
              ).exists
            : false;

          result.push({
            ...data,
            upvote,
            downvote,
            id: document.id,
            createdAt: timestampToNumber(data.createdAt),
            updatedAt: timestampToNumber(data.updatedAt),
            user: {
              displayName: userData.displayName,
              photoURL: userData.photoURL,
              username: userData.username,
            },
          });
        }

        const lastDoc = querySnap.docs.at(-1);
        return {
          result,
          nextCursor: querySnap.docs.length < LIMIT ? undefined : lastDoc?.id,
        };
      } catch (error) {
        console.log(error);
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        parentUid: z.string(),
        questionId: z.string(),
        uid: z.string(),
        detail: z
          .string()
          .min(25, "Answer is too short.")
          .max(10000, "Answer is too big"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { detail, uid, parentUid, questionId } = input;
      const sessionUid = ctx.session?.uid;
      if (uid !== sessionUid || !ctx.session?.email_verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Action",
        });
      }

      try {
        await answerColl(parentUid, questionId).add({
          detail,
          uid,
          questionId,
          likes: 0,
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        });

        return {
          code: 1,
          message: "Answer posted successfully.",
        };
      } catch (e) {
        return {
          code: -1,
          message: "Failed to post the Answer.",
        };
      }
    }),

  edit: protectedProcedure
    .input(
      z.object({
        parentUid: z.string(),
        questionId: z.string(),
        answerId: z.string(),
        uid: z.string(),
        detail: z
          .string()
          .min(300, "Explanation of the answer is too short.")
          .max(10000, "Explanation too big"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { detail, answerId, parentUid, questionId, uid } = input;
      const sessionUid = ctx.session?.uid;
      if (uid !== sessionUid || !ctx.session?.email_verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Action",
        });
      }

      try {
        await answerDoc(parentUid, questionId, answerId).update({
          detail,
          updatedAt: FieldValue.serverTimestamp(),
        });

        return {
          code: 1,
          message: "Answer posted successfully.",
        };
      } catch (e) {
        return {
          code: -1,
          message: "Failed to post the Answer.",
        };
      }
    }),

  delete: protectedProcedure
    .input(
      z.object({
        parentUid: z.string(),
        questionId: z.string(),
        answerId: z.string(),
        uid: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { questionId, answerId, parentUid, uid } = input;
      const sessionUid = ctx.session?.uid;
      if (uid !== sessionUid || !ctx.session?.email_verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Action",
        });
      }

      await answerDoc(parentUid, questionId, answerId).delete();
    }),

  reply: answerReplyRouter,
  vote: answerLikesRouter,
});
