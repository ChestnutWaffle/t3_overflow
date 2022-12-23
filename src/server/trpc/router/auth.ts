import type { User } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore/lite";
import { z } from "zod";
import {
  createUserDoc,
  getUserDocData,
  getUserDocWithUID,
  db,
} from "../../../utils/firebase";

import { router, publicProcedure } from "../trpc";

export const authRouter = router({
  google: publicProcedure
    .input(z.object({ user: z.string() }))
    .mutation(async ({ input }) => {
      const user: User = JSON.parse(input.user);

      const userDocRef = await createUserDoc({ userAuth: user });
      const userData = await getUserDocData(userDocRef);

      return userData;
    }),

  emailSignUp: publicProcedure
    .input(z.object({ user: z.string(), displayName: z.string() }))
    .mutation(async ({ input }) => {
      const user: User = JSON.parse(input.user);
      const { displayName } = input;

      const userDocRef = await createUserDoc({
        userAuth: user,
        fullName: displayName,
      });

      const userData = await getUserDocData(userDocRef);

      return userData;
    }),

  userDataUid: publicProcedure
    .input(z.object({ uid: z.string() }))
    .mutation(async ({ input }) => {
      const userData = await getUserDocWithUID(input.uid);
      return userData;
    }),

  emailVerify: publicProcedure
    .input(z.object({ uid: z.string() }))
    .mutation(async ({ input }) => {
      const docRef = doc(db, "users", input.uid);
      await updateDoc(docRef, {
        emailVerified: true,
      });
      const userData = await getUserDocWithUID(input.uid);
      return userData;
    }),
});
