import type { NextPage } from "next";
import Head from "next/head";
import { useInView } from "react-intersection-observer";

import { trpc } from "@utils/trpc";
import { Fragment, useCallback, useEffect } from "react";
import Post, { PostSkeleton } from "@comp/PageComponents/Post";
import { useCustomToast } from "@hooks/useCustomToast";

const Home: NextPage = () => {
  const { toast } = useCustomToast();
  const { data, hasNextPage, fetchNextPage, isLoading } =
    trpc.home.questions.useInfiniteQuery(
      {},
      {
        getNextPageParam: (data) => data?.nextCursor ?? undefined,
        onError: (error) => {
          toast({
            variant: "error",
            title: error.message,
          });
        },
      }
    );

  const { ref, inView } = useInView();

  const fetchNext = useCallback(() => fetchNextPage(), [fetchNextPage]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNext();
    }
  }, [inView, hasNextPage, fetchNext]);

  return (
    <main className="flex-1 p-4">
      <Head>
        <title>Overflow</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="py-4 text-3xl font-black tracking-wide text-gray-800 dark:text-gray-300">
        Questions
      </h1>
      <div className="flex flex-col gap-4">
        {isLoading
          ? [...Array(5)].map((num, idx) => (
              <PostSkeleton key={`${num}-${idx}`} />
            ))
          : data?.pages.map((page, index) => (
              <Fragment key={index}>
                {page?.result.map((question) => {
                  return <Post key={question.id} question={question} />;
                })}
              </Fragment>
            ))}
        {hasNextPage ? (
          <div className="-z-10 -mt-96 h-96 w-full" ref={ref}></div>
        ) : (
          !isLoading && (
            <p className="text-lg font-bold dark:text-gray-400">
              No more questions
            </p>
          )
        )}
      </div>
    </main>
  );
};

export default Home;
