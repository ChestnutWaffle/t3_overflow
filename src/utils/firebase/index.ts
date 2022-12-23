import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import type { User } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore/lite";
import type {
  DocumentReference,
  DocumentData,
  FieldValue,
} from "firebase/firestore";
import type { OtherParameters } from "../../types/firebase";
import kebabCase from "lodash/kebabCase";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// get auth instance
export const auth = getAuth();
// get firestore instance
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// sign in methods
export const signInGooglePopup = () => signInWithPopup(auth, googleProvider);

export const emailSignIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

// sign out method
export const signUserOut = () => signOut(auth);

export const createAuthUserEmail = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// const actionCodeSettings: ActionCodeSettings = {
//   url:
// }

export const verifyEmail = async () => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
};

setPersistence(auth, browserLocalPersistence);

export const createUserDoc = async ({
  userAuth,
  fullName,
}: OtherParameters) => {
  if (!userAuth) return;

  const userDocRef = doc(db, "users", userAuth.uid);

  const userSnapshot = await getDoc(userDocRef);

  if (!userSnapshot.exists()) {
    const { displayName, email, emailVerified, photoURL } = userAuth;
    const createdAt = serverTimestamp();

    try {
      await setDoc(userDocRef, {
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

  return userDocRef;
};

export const getUserDocData = async (
  userDocRef: DocumentReference<DocumentData> | undefined
) => {
  if (!userDocRef) return;
  const user = await getDoc(userDocRef);
  const userData = user?.data() as UserData;

  return {
    uid: user.id,
    ...userData,
  };
};

export const getUserDocWithUID = async (uid: string) => {
  const docRef = doc(db, "users", uid);
  const userData = await getUserDocData(docRef);

  return userData;
};

export type UserData = {
  displayName: string;
  email: string;
  emailVerified: boolean;
  createdAt: FieldValue;
  photoURL: string;
};

export const googleLoginData = async (user: User) => {
  try {
    const userDocRef = await createUserDoc({ userAuth: user });
    const userData = await getUserDocData(userDocRef);

    return userData;
  } catch (e) {}
};
