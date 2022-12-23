import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "@utils/trpc";
import { Fragment, useCallback, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { TagItem, TagSkeleton } from "@comp/PageComponents/Tags";

const TagListPage: NextPage = () => {
  const { data, isLoading, fetchNextPage, hasNextPage } =
    trpc.tags.tagslist.useInfiniteQuery(
      {},
      {
        getNextPageParam: (data) => data?.nextCursor,
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
        <title>Tags</title>
        <meta name="description" content="" />
      </Head>
      <main className="py-6 px-8 text-gray-700 dark:text-gray-300 ">
        <section className="px-4 py-2">
          <h1 className="mb-6 text-3xl font-black tracking-wide">Tags</h1>
          <div className="xs:grid-cols-1 mb-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {isLoading
              ? [...Array(28)].map((num) => {
                  return <TagSkeleton key={num} />;
                })
              : data?.pages.map((page, index) => (
                  <Fragment key={index}>
                    {page?.result.map((tag) => {
                      return <TagItem key={tag.name} tag={tag} />;
                    })}
                  </Fragment>
                ))}
          </div>
          {hasNextPage ? (
            <div className="-z-10 -mt-96 h-96 w-full" ref={ref}></div>
          ) : (
            !isLoading && (
              <p className="text-lg font-bold dark:text-gray-400">
                No more Tags
              </p>
            )
          )}
        </section>
      </main>
    </>
  );
};

export default TagListPage;
