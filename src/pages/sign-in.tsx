import type { NextPage } from "next";
import Head from "next/head";
import SignIn from "@comp/Auth/SignIn";
import { RedirectHome } from "@context/UserContext";

const SignInPage: NextPage = () => {
  RedirectHome();
  return (
    <main className="flex h-[calc(100vh-60px)] w-full items-center justify-center text-gray-800 dark:text-gray-50">
      <Head>
        <title>Sign In</title>
      </Head>
      <SignIn />
    </main>
  );
};

export default SignInPage;
