// src/pages/_app.tsx
import "@styles/globals.css";

import type { AppType } from "next/app";

import { trpc } from "@utils/trpc";
import { ThemeProvider } from "@context/ThemeContext";
import { UserCtxProvider } from "@context/UserContext";
import Layout from "@comp/Layout";
import { Toaster } from "react-hot-toast";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  return (
    <ThemeProvider>
      <UserCtxProvider>
        <>
          <Layout>
            <Component {...pageProps} />
          </Layout>
          <Toaster position="bottom-right" reverseOrder={false} />
        </>
      </UserCtxProvider>
    </ThemeProvider>
  );
};

export default trpc.withTRPC(MyApp);
