import type { Question } from "@types-local/defined-types";
import { db } from "@utils/firebase";
import { getDateString } from "@utils/index";
import {
  collectionGroup,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  where,
  getDoc,
  doc,
  collection,
} from "firebase/firestore/lite";
import type { Timestamp } from "firebase/firestore/lite";
import { z } from "zod";

import { router, publicProcedure } from "../../trpc";

export const tagsRouter = router({
  tagslist: publicProcedure
    .input(z.object({ cursor: z.string().nullish() }))
    .query(async ({ input }) => {
      const cursor = input.cursor as string | undefined;
      const tagsCollGrp = collection(db, "tags");

      const nthDoc = cursor && (await getDoc(doc(db, "tags", cursor)));

      const LIMIT = 32;

      try {
        const q = !nthDoc
          ? query(tagsCollGrp, orderBy("name", "asc"), limit(LIMIT))
          : query(
              tagsCollGrp,
              orderBy("name", "asc"),
              startAfter(nthDoc),
              limit(LIMIT)
            );

        const querySnap = await getDocs(q);

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
          nextCursor: querySnap.docs.length < LIMIT ? undefined : lastDoc,
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
      const questionsCollGrp = collectionGroup(db, "questions");

      const nthDoc =
        cursor &&
        (await getDoc(doc(db, "users", cursor.uid, "questions", cursor.id)));

      const LIMIT = 10;

      try {
        const q = !nthDoc
          ? query(
              questionsCollGrp,
              where("tags", "array-contains", tagname),
              orderBy("createdAt", "desc"),
              limit(LIMIT)
            )
          : query(
              questionsCollGrp,
              where("tags", "array-contains", tagname),
              orderBy("createdAt", "desc"),
              startAfter(nthDoc),
              limit(LIMIT)
            );

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
