import { auth } from "@utils/firebase";

interface EmailVerifyCheckProps {
  children: JSX.Element;
  fallback?: JSX.Element;
}

const EmailVerifyCheck = ({ children, fallback }: EmailVerifyCheckProps) => {
  return (
    <>
      {auth?.currentUser && auth?.currentUser?.emailVerified
        ? children
        : fallback || null}
    </>
  );
};

export default EmailVerifyCheck;
