import Preview from "@comp/Markdown/Preview";
import type { UserData } from "@types-local/defined-types";
import { getDateString, getInitials } from "@utils/index";
import { trpc } from "@utils/trpc";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useCallback, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { PostSkeleton } from "../Post";

const UserAnswers = ({ userData }: { userData: UserData }) => {
  const router = useRouter();
  const { uid } = router.query;

  const { data, isLoading, hasNextPage, fetchNextPage } =
    trpc.users.useranswers.useInfiniteQuery(
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
        Answers
      </h1>
      <div className="flex flex-col gap-4">
        {isLoading
          ? [...Array(5)].map((num, idx) => (
              <PostSkeleton key={`${num}-${idx}`} />
            ))
          : data?.pages.map((page, index) => (
              <Fragment key={index}>
                {page?.result.map((answer) => {
                  const answerData = {
                    ...answer,
                    user: {
                      displayName: userData.displayName,
                      photoURL: userData.photoURL,
                      username: userData.username,
                    },
                  };
                  return <UserAnswerItem key={answer.id} answer={answerData} />;
                })}
              </Fragment>
            ))}
        {hasNextPage ? (
          <div className="-z-10 -mt-96 h-96 w-full" ref={ref}></div>
        ) : (
          !isLoading && (
            <p className="text-lg font-bold dark:text-gray-400">
              No more answers
            </p>
          )
        )}
      </div>
    </div>
  );
};

type AnswerData = {
  answer: {
    user: {
      displayName: string;
      photoURL: string;
      username: string;
    };
    id: string;
    createdAt: number;
    updatedAt: number;
    likes: number;
    questionId: string;
    questionUid: string;
    detail: string;
    uid: string;
  };
};

const UserAnswerItem = ({ answer }: AnswerData) => {
  return (
    <div
      id={answer.id}
      className="max-h-60 w-full overflow-hidden rounded-md bg-white px-4 py-2 pb-4 shadow-md outline outline-1 outline-zinc-200 hover:max-h-fit hover:scale-[1.01] hover:shadow-lg hover:transition-all hover:duration-200 dark:bg-gray-800 dark:outline-gray-700 dark:hover:shadow-black/40"
    >
      <div className="flex flex-row flex-wrap justify-between gap-4 py-4 text-gray-900 dark:text-gray-100">
        <div>
          <span>
            {answer.likes} like{answer.likes !== 1 && "s"}
          </span>
        </div>
        <div className="ml-auto flex flex-col">
          <Link href={`/users/${answer.uid}/${answer.user.username}`}>
            <div className="flex cursor-pointer justify-between py-2">
              <div className="h-6 w-6 overflow-hidden rounded-md">
                <Image
                  src={
                    answer.user.photoURL === ""
                      ? `https://dummyimage.com/400x400/000/fff.jpg&text=${getInitials(
                          answer.user.displayName
                        ).join("+")}`
                      : answer.user.photoURL
                  }
                  width="24"
                  height="24"
                  alt={answer.user.username}
                />
              </div>
              <span className="text-md ml-2 text-right font-semibold text-blue-700 underline-offset-2 hover:underline dark:text-blue-500">
                {answer.user.displayName}
              </span>
            </div>
          </Link>
          <span className="text-right">
            answered {getDateString(answer.createdAt)}
          </span>
        </div>
      </div>
      <Link href={`/questions/${answer.questionUid}/${answer.questionId}`}>
        <Preview mrkdwnVal={answer.detail} />
      </Link>
    </div>
  );
};

export default UserAnswers;
