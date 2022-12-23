import type { NextPage } from "next";
import Head from "next/head";
import { useInView } from "react-intersection-observer";

import { trpc } from "@utils/trpc";
import { Fragment, useCallback, useEffect } from "react";
import Post, { PostSkeleton } from "@comp/PageComponents/Post";
import { useRouter } from "next/router";

const TagPage: NextPage = () => {
  const router = useRouter();

  const { tagname } = router.query;

  const { data, hasNextPage, fetchNextPage, isLoading } =
    trpc.tags.tagname.useInfiniteQuery(
      { tagname: tagname as string },
      {
        getNextPageParam: (data) => data?.nextCursor ?? undefined,
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
    <>
      <Head>
        <title>Overflow</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex-1 p-4">
        <h1 className="py-4 text-3xl font-black tracking-wide text-gray-800 dark:text-gray-300">
          {tagname}
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
            <p className="text-lg font-bold dark:text-gray-400">
              No more questions
            </p>
          )}
        </div>
      </main>
    </>
  );
};

export default TagPage;
