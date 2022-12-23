import type { User } from "firebase/auth";

export type OtherParameters = {
  userAuth: User;
  fullName?: string;
};
