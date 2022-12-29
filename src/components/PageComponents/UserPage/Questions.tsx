import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import { Fragment, useCallback, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Post, { PostSkeleton } from "../Post";
import type { UserData } from "@types-local/defined-types";

const UserQuestions = ({ userData }: { userData: UserData }) => {
  const router = useRouter();
  const { uid } = router.query;

  const { data, isLoading, hasNextPage, fetchNextPage } =
    trpc.users.userquestions.useInfiniteQuery(
      {
        parentUid: uid as string,
      },
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
    <div>
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
                  const out = {
                    ...question,
                    user: {
                      displayName: userData.displayName,
                      photoURL: userData.photoURL,
                      username: userData.username,
                    },
                  };
                  return <Post key={question.id} question={out} />;
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
    </div>
  );
};

export default UserQuestions;
