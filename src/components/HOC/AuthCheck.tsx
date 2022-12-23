import { auth } from "@utils/firebase";
import type { ReactNode } from "react";

interface AuthCheckProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const AuthCheck = ({ children, fallback }: AuthCheckProps) => {
  return <>{auth?.currentUser ? children : fallback || null}</>;
};

export default AuthCheck;
