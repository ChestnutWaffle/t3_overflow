import { getDateString } from "@utils/index";
import { trpc } from "@utils/trpc";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useCallback, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { PostSkeleton } from "../Post";

const UserReplies = () => {
  const router = useRouter();
  const { uid } = router.query;

  const { data, isLoading, hasNextPage, fetchNextPage } =
    trpc.users.userreplies.useInfiniteQuery(
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
        Replies
      </h1>
      <div className="flex flex-col gap-4">
        {isLoading
          ? [...Array(5)].map((num, idx) => (
              <PostSkeleton key={`${num}-${idx}`} />
            ))
          : data?.pages.map((page, index) => (
              <Fragment key={index}>
                {page?.result.map((reply) => {
                  return <UserReplyItem key={reply.id} reply={reply} />;
                })}
              </Fragment>
            ))}
        {hasNextPage ? (
          <div className="-z-10 -mt-96 h-96 w-full" ref={ref}></div>
        ) : (
          !isLoading && (
            <p className="text-lg font-bold dark:text-gray-400">
              No more replies
            </p>
          )
        )}
      </div>
    </div>
  );
};

type ReplyData = {
  reply: {
    id: string;
    createdAt: number;
    updatedAt: number;
    questionId: string;
    questionUid: string;
    reply: string;
    uid: string;
    username: string;
    displayName: string;
    answerId: string;
  };
};

const UserReplyItem = ({ reply }: ReplyData) => {
  return (
    <div
      id={reply.id}
      className="max-h-60 w-full overflow-hidden rounded-md bg-white px-4 py-2 pb-4 shadow-md outline outline-1 outline-zinc-200 hover:max-h-fit hover:scale-[1.01] hover:shadow-lg hover:transition-all hover:duration-200 dark:bg-gray-800 dark:outline-gray-700 dark:hover:shadow-black/40"
    >
      <div className="flex flex-col justify-between gap-6 border-gray-200 py-4 dark:border-gray-600 md:flex-row">
        <Link href={`/questions/${reply.questionUid}/${reply.questionId}`}>
          <div className="px-2">
            <span className="break-words text-sm">{reply.reply}</span>
          </div>
        </Link>
        <div className="ml-auto mt-auto flex min-w-fit gap-2">
          <Link href={`/users/${reply.uid}/${reply.username}`}>
            <span className="text-md ml-2 font-semibold text-blue-700 underline-offset-2 hover:underline">
              {reply.displayName}
            </span>
          </Link>
          <span className="text-right">
            replied {getDateString(reply.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserReplies;
