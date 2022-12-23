import { getDateString } from "@utils/index";
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
import type {
  DocumentData,
  Query,
  Timestamp,
  QueryDocumentSnapshot,
} from "firebase/firestore/lite";
import { z } from "zod";

import { router, publicProcedure } from "../../trpc";
import type { Question } from "@types-local/defined-types";
import { TRPCClientError } from "@trpc/client";

export const homeRouter = router({
  questions: publicProcedure
    .input(z.object({ cursor: z.any().nullish() }))
    .query(async ({ input }) => {
      const cursor = input.cursor as
        | QueryDocumentSnapshot<DocumentData>
        | undefined;
      const questionsCollGrp = collectionGroup(db, "questions");

      const LIMIT = 40;

      let q: Query<DocumentData>;

      try {
        if (!cursor) {
          q = query(
            questionsCollGrp,
            orderBy("createdAt", "desc"),
            limit(LIMIT)
          );
        } else {
          q = query(
            questionsCollGrp,
            orderBy("createdAt", "desc"),
            startAfter(cursor),
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
            createdAt: getDateString(
              data.createdAt.seconds * 1000 +
                data.createdAt.nanoseconds / 1000000
            ),
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

        const lastDoc = querySnap.docs[querySnap.docs.length - 1];

        return {
          result,
          nextCursor: querySnap.docs.length < LIMIT ? undefined : lastDoc,
        };
      } catch (error) {
        throw new TRPCClientError(`Failed to fetch data ${error}`);
      }
    }),
});
