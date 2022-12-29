import type { QuestionData, UserData } from "@types-local/defined-types";
import { publicProcedure } from "./../../trpc";
import { questionReplyRouter } from "./replies";
import { db } from "@utils/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore/lite";
import { z } from "zod";
import kebabCase from "lodash/kebabCase";

import { router, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { timestampToNumber } from "@utils/index";
import { questionLikesRouter } from "./votes";

export const questionRouter = router({
  read: publicProcedure
    .input(z.object({ questionId: z.string(), uid: z.string() }))
    .query(async ({ input, ctx }) => {
      const { questionId, uid } = input;
      const sessionUid = ctx.session?.uid;

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

      const questionRef = doc(db, "users", uid, "questions", questionId);
      const userRef = doc(db, "users", uid);
      try {
        const question = await getDoc(questionRef);

        const user = (await getDoc(userRef)).data() as UserData;

        const questionData = question.data() as QuestionData;

        const result = {
          id: question.id,
          ...questionData,
          upvote,
          downvote,
          createdAt: timestampToNumber(questionData.createdAt),
          updatedAt: timestampToNumber(questionData.updatedAt),
          user: {
            displayName: user.displayName,
            username: user.username,
            photoURL: user.photoURL,
          },
        };

        return result;
      } catch (error) {
        if (error instanceof Error) console.log(error);
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        uid: z.string(),
        question: z
          .string()
          .min(1, "This field is required.")
          .min(50, "Please be more descriptive, (Atleast 50 characters).")
          .max(250, "Please keep your question short."),
        tags: z
          .array(
            z
              .string()
              .min(1, "Tag is too short")
              .trim()
              .max(15, "A tag cannot be that long")
          )
          .min(1, "Atleast one tag is required")
          .max(5, "Maximum of 5 Tags is allowed"),
        detail: z
          .string()
          .min(300, "Explanation of the question is too short.")
          .max(10000, "Explanation too big"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { detail, question, tags, uid } = input;
      const sessionUid = ctx.session?.uid;
      if (uid !== sessionUid || !ctx.session?.email_verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Action",
        });
      }

      try {
        const questionColl = collection(db, "users", uid, "questions");
        await addDoc(questionColl, {
          title: question,
          slug: kebabCase(question),
          detail,
          tags,
          uid,
          likes: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        tags.forEach(async (tag) => {
          const tagRef = doc(db, "tags", tag);
          const tagDoc = await getDoc(tagRef);

          if (tagDoc.exists()) {
            await updateDoc(tagRef, {
              count: increment(1),
            });
          } else {
            await setDoc(tagRef, { count: increment(1), name: tag });
          }
        });

        return {
          code: 1,
          message: "Question created successfully.",
        };
      } catch (e) {
        return {
          code: -1,
          message: "Failed to create Question.",
        };
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        questionId: z.string(),
        uid: z.string(),
        data: z.object({
          detail: z.string(),
          tags: z.array(
            z
              .string()
              .min(2, "Tag length must me atleast 2 letters.")
              .max(30, "Tag length must not exceed 30 letters.")
          ),
        }),
        oldData: z.object({
          tags: z.array(
            z
              .string()
              .min(2, "Tag length must me atleast 2 letters.")
              .max(30, "Tag length must not exceed 30 letters.")
          ),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        uid,
        questionId,
        data,
        oldData: { tags: oldTags },
      } = input;

      const sessionUid = ctx.session?.uid;
      if (uid !== sessionUid || !ctx.session?.email_verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Action",
        });
      }

      const { detail, tags } = data;

      const filteredOld = oldTags.filter((tag) => {
        return !(tag in tags);
      });
      filteredOld.forEach(async (tag) => {
        const tagRef = doc(db, "tags", tag);
        await updateDoc(tagRef, {
          count: increment(-1),
        });
      });

      const questionRef = doc(db, "users", uid, "questions", questionId);
      await updateDoc(questionRef, {
        detail,
        tags,
        updatedAt: serverTimestamp(),
      });

      const filteredNew = tags.filter((tag) => {
        return !(tag in oldTags);
      });
      filteredNew.forEach(async (tag) => {
        const tagRef = doc(db, "tags", tag);
        await updateDoc(tagRef, {
          count: increment(1),
        });
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        uid: z.string(),
        questionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { uid, questionId } = input;
      const sessionUid = ctx.session?.uid;
      if (uid !== sessionUid || !ctx.session?.email_verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized Action",
        });
      }

      const questionRef = doc(db, "users", uid, "questions", questionId);

      await deleteDoc(questionRef);
    }),

  reply: questionReplyRouter,
  vote: questionLikesRouter,
});
