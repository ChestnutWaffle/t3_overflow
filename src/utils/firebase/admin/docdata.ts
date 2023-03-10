import { userDoc } from ".";
import type { User } from "firebase/auth";
import { FieldValue } from "firebase-admin/firestore";
import { kebabCase } from "lodash";

export type CUDParams = {
  userAuth: User;
  fullName?: string;
};

export type UserData = {
  displayName: string;
  email: string;
  emailVerified: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  photoURL: string;
  username: string;
};

export const getUserData = async (user: string) => {
  const userRef = await userDoc(user).get();
  const userData = userRef.data() as UserData;
  return {
    uid: userRef.id,
    ...userData,
  };
};

export const createUserDoc = async ({ userAuth, fullName }: CUDParams) => {
  if (!userAuth) return;

  const userRef = userDoc(userAuth.uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    const { displayName, email, emailVerified, photoURL } = userAuth;
    const createdAt = FieldValue.serverTimestamp();

    try {
      await userRef.set({
        displayName: displayName || fullName,
        username: kebabCase(displayName || fullName),
        email,
        emailVerified,
        createdAt,
        photoURL: photoURL || "",
      });
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
  }

  return userRef;
};
