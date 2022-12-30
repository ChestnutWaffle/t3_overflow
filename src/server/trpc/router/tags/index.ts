import type { Question } from "@types-local/defined-types";
import { timestampToNumber } from "@utils/index";
import { z } from "zod";

import { router, publicProcedure } from "@server/trpc/trpc";
import {
  questionDoc,
  questionsCollGrp,
  tagsColl,
  tagsDoc,
} from "@utils/firebase/admin";
import { getUserData } from "@utils/firebase/admin/docdata";

export const tagsRouter = router({
  tagslist: publicProcedure
    .input(z.object({ cursor: z.string().nullish() }))
    .query(async ({ input }) => {
      const cursor = input.cursor as string | undefined;

      const nthDoc = cursor ? await tagsDoc(cursor).get() : undefined;

      const LIMIT = 32;

      try {
        const q = !nthDoc
          ? tagsColl.orderBy("name", "asc").limit(LIMIT)
          : tagsColl.orderBy("name", "asc").startAfter(nthDoc).limit(LIMIT);
        const querySnap = await q.get();

        const result: {
          name: string;
          count: number;
        }[] = [];

        for (let i = 0; i < querySnap.docs.length; i++) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const document = querySnap.docs[i]!;
          const { count, name } = document.data() as {
            name: string;
            count: number;
          };
          result.push({
            name,
            count,
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

  tagname: publicProcedure
    .input(
      z.object({
        cursor: z.object({ id: z.string(), uid: z.string() }).nullish(),
        tagname: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { cursor, tagname } = input;

      const nthDoc = cursor
        ? await questionDoc(cursor.uid, cursor.id).get()
        : undefined;

      const LIMIT = 10;

      try {
        const q = !nthDoc
          ? questionsCollGrp
              .where("tags", "array-contains", tagname)
              .orderBy("createdAt", "desc")
              .limit(LIMIT)
          : questionsCollGrp
              .where("tags", "array-contains", tagname)
              .orderBy("createdAt", "desc")
              .startAfter(nthDoc)
              .limit(LIMIT);
        const querySnap = await q.get();

        const result: Question[] = [];

        for (let i = 0; i < querySnap.docs.length; i++) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const document = querySnap.docs[i]!;
          const data = document.data();
          const userData = await getUserData(data.uid);

          if (!userData) continue;

          result.push({
            id: document.id,
            createdAt: timestampToNumber(data.createdAt),
            tags: data.tags,
            title: data.title,
            uid: data.uid,
            user: {
              displayName: userData.displayName,
              photoURL: userData.photoURL,
              username: userData.username,
            },
          });
        }

        const lastDoc = querySnap.docs[querySnap.docs.length - 1];

        return {
          result,
          nextCursor:
            querySnap.docs.length < LIMIT
              ? undefined
              : { id: lastDoc?.id, uid: lastDoc?.data().uid },
        };
      } catch (error) {
        if (error instanceof Error) console.log(error);
      }
    }),
});
