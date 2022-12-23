import { db } from "@utils/firebase";
import {
  collectionGroup,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
} from "firebase/firestore/lite";
import type { Timestamp } from "firebase/firestore/lite";
import { z } from "zod";

import { router, publicProcedure } from "../../trpc";

export const usersRouter = router({
  userslist: publicProcedure
    .input(z.object({ cursor: z.any().nullish() }))
    .query(async ({ input }) => {
      const { cursor } = input;
      const usersCollGrp = collectionGroup(db, "users");

      const LIMIT = 32;

      try {
        const q = !cursor
          ? query(usersCollGrp, orderBy("displayName", "asc"), limit(LIMIT))
          : query(
              usersCollGrp,
              orderBy("displayName", "asc"),
              startAfter(cursor),
              limit(LIMIT)
            );

        const querySnap = await getDocs(q);

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
            createdAt: Timestamp;
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
          nextCursor: querySnap.docs.length < LIMIT ? undefined : lastDoc,
        };
      } catch (error) {
        if (error instanceof Error) console.log(error);
      }
    }),
});
