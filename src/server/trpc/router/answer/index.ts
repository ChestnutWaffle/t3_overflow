import { answerReplyRouter } from "./replies";
import { TRPCError } from "@trpc/server";
import { db } from "@utils/firebase";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
} from "firebase/firestore/lite";
import type { Query, DocumentData, Timestamp } from "firebase/firestore/lite";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "@server/trpc/trpc";
import { timestampToNumber } from "@utils/index";
import type { AnswerResult, AnswerData } from "@types-local/defined-types";
import { answerLikesRouter } from "./votes";

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

      const nthDoc =
        cursor &&
        (await getDoc(
          doc(db, "users", uid, "questions", questionId, "answers", cursor)
        ));

      const answersColl = collection(
        db,
        "users",
        uid,
        "questions",
        questionId,
        "answers"
      );

      const LIMIT = 1;

      let q: Query<DocumentData>;

      try {
        if (!nthDoc) {
          q = query(answersColl, orderBy("likes", "desc"), limit(LIMIT));
        } else {
          q = query(
            answersColl,
            orderBy("likes", "desc"),
            startAfter(nthDoc),
            limit(LIMIT)
          );
        }
        const querySnap = await getDocs(q);
        const result: AnswerResult[] = [];

        for (let i = 0; i < querySnap.docs.length; i++) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const document = querySnap.docs[i]!;
          const data = document.data() as AnswerData;
          const userDoc = await getDoc(doc(db, "users", data.uid));
          const userData = userDoc.data() as {
            displayName: string;
            createdAt: Timestamp;
            updatedAt: Timestamp;
            email: string;
            emailVerified: boolean;
            photoURL: string;
            username: string;
          };

          const upvote = sessionUid
            ? (
                await getDoc(
                  doc(
                    db,
                    "users",
                    uid,
                    "questions",
                    questionId,
                    "answers",
                    document.id,
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
                    "answers",
                    document.id,
                    "downvotes",
                    sessionUid
                  )
                )
              ).exists()
            : false;

          result.push({
            ...data,
            upvote,
            downvote,
            id: document.id,
            createdAt: timestampToNumber(data.createdAt),
            updatedAt: timestampToNumber(data.updatedAt),
            user: {
              displayName: userData?.displayName,
              photoURL: userData?.photoURL,
              username: userData?.username,
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
        const answerColl = collection(
          db,
          "users",
          parentUid,
          "questions",
          questionId,
          "answers"
        );
        await addDoc(answerColl, {
          detail,
          uid,
          questionId,
          likes: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
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
        const answerRef = doc(
          db,
          "users",
          parentUid,
          "questions",
          questionId,
          "answers",
          answerId
        );
        await updateDoc(answerRef, {
          detail,
          updatedAt: serverTimestamp(),
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

      const answerRef = doc(
        db,
        "users",
        parentUid,
        "questions",
        questionId,
        "answers",
        answerId
      );

      await deleteDoc(answerRef);
    }),

  reply: answerReplyRouter,
  vote: answerLikesRouter,
});
