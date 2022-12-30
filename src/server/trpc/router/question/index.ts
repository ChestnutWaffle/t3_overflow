import type { QuestionData } from "@types-local/defined-types";
import { publicProcedure, router, protectedProcedure } from "@server/trpc/trpc";
import { questionReplyRouter } from "./replies";
import { z } from "zod";
import kebabCase from "lodash/kebabCase";
import { TRPCError } from "@trpc/server";
import { timestampToNumber } from "@utils/index";
import { questionLikesRouter } from "./votes";
import {
  questionDoc,
  questionDownvoteDoc,
  questionsColl,
  questionUpvoteDoc,
  tagsDoc,
} from "@utils/firebase/admin";
import { getUserData } from "@utils/firebase/admin/docdata";
import { FieldValue } from "firebase-admin/firestore";

export const questionRouter = router({
  read: publicProcedure
    .input(z.object({ questionId: z.string(), uid: z.string() }))
    .query(async ({ input, ctx }) => {
      const { questionId, uid } = input;
      const sessionUid = ctx.session?.uid;

      const upvote = sessionUid
        ? (await questionUpvoteDoc(uid, questionId, sessionUid).get()).exists
        : false;

      const downvote = sessionUid
        ? (await questionDownvoteDoc(uid, questionId, sessionUid).get()).exists
        : false;

      const questionRef = questionDoc(uid, questionId);
      try {
        const question = await questionRef.get();

        const user = await getUserData(uid);

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
        await questionsColl(uid).add({
          title: question,
          slug: kebabCase(question),
          detail,
          tags,
          uid,
          likes: 0,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        tags.forEach(async (tag) => {
          const tagRef = tagsDoc(tag);

          if ((await tagRef.get()).exists) {
            await tagRef.update({
              count: FieldValue.increment(1),
            });
          } else {
            await tagRef.set({ count: FieldValue.increment(1), name: tag });
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
        const tagRef = tagsDoc(tag);
        await tagRef.update({
          count: FieldValue.increment(-1),
        });
      });

      const questionRef = questionDoc(uid, questionId);
      await questionRef.update({
        detail,
        tags,
        updatedAt: FieldValue.serverTimestamp(),
      });

      const filteredNew = tags.filter((tag) => {
        return !(tag in oldTags);
      });
      filteredNew.forEach(async (tag) => {
        const tagRef = tagsDoc(tag);
        await tagRef.update({
          count: FieldValue.increment(1),
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

      const questionRef = questionDoc(uid, questionId);

      await questionRef.delete();
    }),

  reply: questionReplyRouter,
  vote: questionLikesRouter,
});
