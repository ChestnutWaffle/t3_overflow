import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useGlobalLoading from "@hooks/useGlobalLoading";

const Loading = () => {
  const { globalLoading } = useGlobalLoading();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const router = useRouter();

  const [routerLoading, setRouterLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url: string) =>
      url !== router.asPath && setRouterLoading(true);
    const handleComplete = (url: string) =>
      url === router.asPath && setRouterLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  });

  return (
    <>
      {(!!isFetching || !!isMutating || routerLoading || globalLoading) && (
        <div className="visible-after-half absolute z-20 h-1 w-screen bg-blue-700/40">
          <div
            id="progress"
            className="absolute z-20 h-1 w-screen overflow-hidden shadow-lg shadow-blue-700 drop-shadow-lg"
          />
        </div>
      )}
    </>
  );
};

export default Loading;
