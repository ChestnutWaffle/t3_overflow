import type { NextPage } from "next";
import SignUp from "@comp/Auth/SignUp";
import { RedirectHome } from "@context/UserContext";
import Head from "next/head";

const SignInUpPage: NextPage = () => {
  RedirectHome();
  return (
    <main className="flex-1 p-4">
      <Head>
        <title>Sign In</title>
      </Head>
      <SignUp />
    </main>
  );
};

export default SignInUpPage;
