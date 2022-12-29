import { timestampToNumber } from "@utils/index";
import { db } from "@utils/firebase";
import {
  collectionGroup,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  doc,
  getDoc,
} from "firebase/firestore/lite";
import type { DocumentData, Query, Timestamp } from "firebase/firestore/lite";
import { z } from "zod";

import { router, publicProcedure } from "../../trpc";
import type { Question } from "@types-local/defined-types";
import { TRPCClientError } from "@trpc/client";

export const homeRouter = router({
  questions: publicProcedure
    .input(
      z.object({
        cursor: z.object({ id: z.string(), uid: z.string() }).nullish(),
      })
    )
    .query(async ({ input }) => {
      const { cursor } = input;
      const questionsCollGrp = collectionGroup(db, "questions");

      const nthDoc =
        cursor &&
        (await getDoc(doc(db, "users", cursor.uid, "questions", cursor.id)));

      const LIMIT = 10;

      let q: Query<DocumentData>;

      try {
        if (!nthDoc) {
          q = query(
            questionsCollGrp,
            orderBy("createdAt", "desc"),
            limit(LIMIT)
          );
        } else {
          q = query(
            questionsCollGrp,
            orderBy("createdAt", "desc"),
            startAfter(nthDoc),
            limit(LIMIT)
          );
        }

        const querySnap = await getDocs(q);

        const result: Question[] = [];

        for (let i = 0; i < querySnap.docs.length; i++) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const document = querySnap.docs[i]!;
          const data = document.data();
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

          if (!userData) continue;

          result.push({
            id: document.id,
            createdAt: timestampToNumber(data.createdAt),
            tags: data.tags,
            title: data.title,
            uid: data.uid,
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
