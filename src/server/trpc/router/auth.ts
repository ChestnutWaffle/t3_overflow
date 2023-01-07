import { createUserDoc, getUserData } from "@utils/firebase/admin/docdata";
import type { User } from "firebase/auth";
import { z } from "zod";

import { router, publicProcedure } from "../trpc";
import { userDoc } from "@utils/firebase/admin";

export const authRouter = router({
  google: publicProcedure
    .input(z.object({ user: z.string() }))
    .mutation(async ({ input }) => {
      const user: User = JSON.parse(input.user);

      const userDocRef = await createUserDoc({ userAuth: user });
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const userData = await getUserData(userDocRef!.id);

      return userData;
    }),

  userDataUid: publicProcedure
    .input(z.object({ uid: z.string() }))
    .mutation(async ({ input }) => {
      const userData = await getUserData(input.uid);
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

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const userData = await getUserData(userDocRef!.id);

      return userData;
    }),

  emailVerify: publicProcedure
    .input(z.object({ uid: z.string() }))
    .mutation(async ({ input }) => {
      const docRef = userDoc(input.uid);
      await docRef.update({
        emailVerified: true,
      });
      const userData = await getUserData(input.uid);
      return userData;
    }),
});
