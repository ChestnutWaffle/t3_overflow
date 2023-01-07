import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { User } from "firebase/auth";
import { trpc } from "@utils/trpc";

type UserData = {
  displayName: string | null;
  email: string | null;
  emailVerified: boolean | null;
  photoURL: string | null;
  uid: string | null;
};

export const UserCtx = createContext<{
  userData: UserData;
  updateCtx: (userData: UserData | undefined) => void;
}>({
  userData: {
    displayName: null,
    email: null,
    emailVerified: null,
    photoURL: null,
    uid: null,
  },
  updateCtx: () => null,
});

export const useUser: () => {
  userData: UserData;
  updateCtx: (userData: UserData | undefined) => void;
} = () => useContext(UserCtx);

export const UserCtxProvider = ({ children }: { children: JSX.Element }) => {
  const [userCtxData, setUserCtxData] = useState<UserData>({
    displayName: null,
    email: null,
    emailVerified: null,
    photoURL: null,
    uid: null,
  });

  const updateCtx = (userData: UserData | undefined) => {
    if (!userData) return;
    setUserCtxData({
      displayName: userData.displayName,
      email: userData.email,
      emailVerified: userData.emailVerified,
      photoURL: userData.photoURL,
      uid: userData.uid,
    });
  };

  const getUserDataMutation = trpc.auth.userDataUid.useMutation({
    onSuccess: (data) => {
      updateCtx(data);
    },
  });

  useEffect(() => {
    const authUser = localStorage.getItem(
      `firebase:authUser:${process.env.NEXT_PUBLIC_FIREBASE_APIKEY}:[DEFAULT]`
    );
    if (!authUser) return;
    const { uid }: User = JSON.parse(authUser);

    getUserDataMutation.mutate({ uid });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    userData: userCtxData,
    updateCtx,
  };

  return <UserCtx.Provider value={value}>{children}</UserCtx.Provider>;
};

export const RedirectHome = () => {
  const { userData } = useContext(UserCtx);
  const router = useRouter();

  if (userData.email) {
    router.push("/");
  }
};
