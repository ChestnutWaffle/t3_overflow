import { z } from "zod";

import { router, publicProcedure } from "../../trpc";
import { timestampToNumber } from "@utils/index";
import { TRPCClientError } from "@trpc/client";
import { getUserData } from "@utils/firebase/admin/docdata";
import {
  answersCollGrp,
  docWithPath,
  questionDoc,
  questionsCollGrp,
  repliesCollGrp,
  userDoc,
  usersColl,
} from "@utils/firebase/admin";

export const usersRouter = router({
  userslist: publicProcedure
    .input(z.object({ cursor: z.string().nullish() }))
    .query(async ({ input }) => {
      const { cursor } = input;

      const LIMIT = 32;

      const nthDoc = cursor ? await userDoc(cursor).get() : undefined;

      try {
        const q = !nthDoc
          ? usersColl.orderBy("displayName", "asc").limit(LIMIT)
          : usersColl
              .orderBy("displayName", "asc")
              .startAfter(nthDoc)
              .limit(LIMIT);
        const querySnap = await q.get();

        const result: {
          uid: string;
          displayName: string;
          photoURL: string;
          username: string;
        }[] = [];

        for (let i = 0; i < querySnap.docs.length; i++) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const document = querySnap.docs[i]!;
          const data = document.data() as {
            displayName: string;
            createdAt: FirebaseFirestore.Timestamp;
            email: string;
            emailVerified: boolean;
            photoURL: string;
            username: string;
          };

          if (!data) continue;

          result.push({
            uid: document.id,
            photoURL: data.photoURL,
            displayName: data.displayName,
            username: data.username,
          });
        }

        const lastDoc = querySnap.docs[querySnap.docs.length - 1];

        return {
          result,
          nextCursor: querySnap.docs.length < LIMIT ? undefined : lastDoc?.id,
        };
      } catch (error) {
        if (error instanceof Error) console.log(error);
      }
    }),

  userdata: publicProcedure
    .input(
      z.object({
        parentUid: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { parentUid } = input;
      const sessionUid = ctx.session?.uid;
      const userData = await getUserData(parentUid);

      return {
        userData,
        editable: sessionUid === parentUid,
      };
    }),

  userquestions: publicProcedure
    .input(
      z.object({
        parentUid: z.string(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const { parentUid, cursor } = input;

      const LIMIT = 5;

      const nthDoc = cursor
        ? await questionDoc(parentUid, cursor).get()
        : undefined;

      const q = !nthDoc
        ? questionsCollGrp
            .where("uid", "==", parentUid)
            .orderBy("createdAt", "desc")
            .limit(LIMIT)
        : questionsCollGrp
            .where("uid", "==", parentUid)
            .orderBy("createdAt", "desc")
            .startAfter(nthDoc)
            .limit(LIMIT);
      try {
        const querySnapshot = await q.get();
        const result: {
          id: string;
          createdAt: number;
          tags: string[];
          title: string;
          uid: string;
        }[] = [];

        querySnapshot.forEach((document) => {
          const data = document.data();

          result.push({
            id: document.id,
            createdAt: timestampToNumber(data.createdAt),
            tags: data.tags,
            title: data.title,
            uid: data.uid,
          });
        });

        const lastDoc = querySnapshot.docs.at(-1);

        return {
          result,
          nextCursor:
            querySnapshot.docs.length < LIMIT ? undefined : lastDoc?.id,
        };
      } catch (error) {
        throw new TRPCClientError(`Failed to fetch data ${error}`);
      }
    }),

  useranswers: publicProcedure
    .input(z.object({ parentUid: z.string(), cursor: z.string().nullish() }))
    .query(async ({ input }) => {
      const { parentUid, cursor } = input;

      const LIMIT = 5;

      const nthDoc =
        cursor && cursor !== "" ? await docWithPath(cursor).get() : undefined;

      const q = !nthDoc
        ? answersCollGrp
            .where("uid", "==", parentUid)
            .orderBy("createdAt", "desc")
            .limit(LIMIT)
        : answersCollGrp
            .where("uid", "==", parentUid)
            .orderBy("createdAt", "desc")
            .startAfter(nthDoc)
            .limit(LIMIT);
      try {
        const querySnapshot = await q.get();
        const result: {
          id: string;
          createdAt: number;
          updatedAt: number;
          likes: number;
          questionId: string;
          questionUid: string;
          detail: string;
          uid: string;
        }[] = [];

        querySnapshot.forEach((document) => {
          const data = document.data();

          result.push({
            id: document.id,
            createdAt: timestampToNumber(data.createdAt),
            uid: data.uid,
            detail: data.detail,
            likes: data.likes,
            questionId: data.questionId,
            updatedAt: data.updatedAt,
            questionUid: data.questionUid,
          });
        });

        const lastDoc = querySnapshot.docs.at(-1);

        return {
          result,
          nextCursor:
            querySnapshot.docs.length < LIMIT ? undefined : lastDoc?.ref.path,
        };
      } catch (error) {
        throw new TRPCClientError(`Failed to fetch data ${error}`);
      }
    }),

  userreplies: publicProcedure
    .input(z.object({ parentUid: z.string(), cursor: z.string().nullish() }))
    .query(async ({ input }) => {
      const { parentUid, cursor } = input;

      const LIMIT = 5;

      const nthDoc =
        cursor && cursor !== "" ? await docWithPath(cursor).get() : undefined;

      const q = !nthDoc
        ? repliesCollGrp
            .where("uid", "==", parentUid)
            .orderBy("createdAt", "desc")
            .limit(LIMIT)
        : repliesCollGrp
            .where("uid", "==", parentUid)
            .orderBy("createdAt", "desc")
            .startAfter(nthDoc)
            .limit(LIMIT);
      try {
        const querySnapshot = await q.get();
        const result: {
          id: string;
          createdAt: number;
          updatedAt: number;
          displayName: string;
          username: string;
          reply: string;
          uid: string;
          questionId: string;
          questionUid: string;
          answerId: string;
        }[] = [];

        querySnapshot.forEach((document) => {
          const data = document.data();

          result.push({
            id: document.id,
            createdAt: timestampToNumber(data.createdAt),
            uid: data.uid,
            reply: data.reply,
            displayName: data.displayName,
            username: data.username,
            updatedAt: data.updatedAt,
            questionId: data.questionId,
            questionUid: data.questionUid,
            answerId: data.answerId,
          });
        });

        const lastDoc = querySnapshot.docs.at(-1);

        return {
          result,
          nextCursor:
            querySnapshot.docs.length < LIMIT ? undefined : lastDoc?.ref.path,
        };
      } catch (error) {
        throw new TRPCClientError(`Failed to fetch data ${error}`);
      }
    }),
});
