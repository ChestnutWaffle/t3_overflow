import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "@utils/trpc";
import { Fragment, useCallback, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import UserItem, { UserSkeleton } from "@comp/PageComponents/Users";

const UserListPage: NextPage = () => {
  const { data, isLoading, fetchNextPage, hasNextPage } =
    trpc.users.userslist.useInfiniteQuery(
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
    <main className="py-6 px-8 text-gray-700 dark:text-gray-300 ">
      <Head>
        <title>Users</title>
        <meta name="description" content="" />
      </Head>
      <section className="px-4 py-2">
        <h1 className="mb-6 text-3xl font-black tracking-wide">Users</h1>
        <div className="xs:grid-cols-1 mb-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isLoading
            ? [...Array(12)].map((num) => <UserSkeleton key={num} />)
            : data?.pages.map((page, index) => (
                <Fragment key={index + "" + index}>
                  {page?.result.map((user) => {
                    return <UserItem key={user.uid} user={user} />;
                  })}
                </Fragment>
              ))}
        </div>
        {hasNextPage ? (
          <div className="-z-10 -mt-96 h-96 w-full" ref={ref}></div>
        ) : (
          !isLoading && (
            <p className="text-lg font-bold dark:text-gray-400">
              No more Users
            </p>
          )
        )}
      </section>
    </main>
  );
};

export default UserListPage;
