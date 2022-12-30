import { timestampToNumber } from "@utils/index";
import { z } from "zod";

import { router, publicProcedure } from "../../trpc";
import type { Question } from "@types-local/defined-types";
import { TRPCClientError } from "@trpc/client";
import { questionDoc, questionsCollGrp } from "@utils/firebase/admin";
import { getUserData } from "@utils/firebase/admin/docdata";

export const homeRouter = router({
  questions: publicProcedure
    .input(
      z.object({
        cursor: z.object({ id: z.string(), uid: z.string() }).nullish(),
      })
    )
    .query(async ({ input }) => {
      const { cursor } = input;

      const nthDoc = cursor
        ? await questionDoc(cursor.uid, cursor.id).get()
        : undefined;

      const LIMIT = 10;

      try {
        const q = !nthDoc
          ? questionsCollGrp.orderBy("createdAt", "desc").limit(LIMIT)
          : questionsCollGrp
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

        const lastDoc = querySnap.docs.at(-1);

        return {
          result,
          nextCursor:
            querySnap.docs.length < LIMIT
              ? undefined
              : { id: lastDoc?.id, uid: lastDoc?.data().uid },
        };
      } catch (error) {
        throw new TRPCClientError(`Failed to fetch data ${error}`);
      }
    }),
});
