import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { trpc } from "@utils/trpc";
import _404 from "@pages/404";
import { getDateString, getInitials } from "@utils/index";
import Post, { PostSkeleton } from "@comp/PageComponents/Post";
import type { UserData } from "@types-local/defined-types";
import { useInView } from "react-intersection-observer";
import { Fragment, useCallback, useEffect } from "react";
import Link from "next/link";
import Preview from "@comp/Markdown/Preview";

const UserPage: NextPage = () => {
  const router = useRouter();

  const uid = router.query.uid as string;
  const username = router.query.username as string;
  const filter = (router.query.filter as string) || "questions";

  if (!uid || !username) return <_404 />;

  const { data, isLoading } = trpc.users.userdata.useQuery({
    parentUid: uid as string,
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <main className="pt-6 pb-0 text-gray-700 dark:text-gray-300 sm:px-8 sm:pb-6 ">
      <Head>
        <title>{data?.userData.displayName}</title>
      </Head>
      {data && (
        <section className="mt-[150px] px-4 py-2">
          <header className="flex flex-col items-center justify-center gap-2 md:flex-row md:justify-start">
            <div className="-mt-[125px] flex items-center px-4">
              <Image
                className="rounded-md"
                src={
                  !data.userData.photoURL || data.userData.photoURL === ""
                    ? `https://dummyimage.com/400x400/000/fff.jpg&text=${getInitials(
                        data.userData.displayName
                      ).join("")}`
                    : data.userData.photoURL
                }
                width="200"
                height="200"
                alt={data.userData.username || ""}
              />
            </div>

            <span className="text-center text-3xl font-semibold sm:text-4xl md:text-start ">
              {data?.userData.displayName}
            </span>
          </header>

          <div className="mt-6 overflow-hidden rounded-lg bg-gray-50 p-1 text-center text-sm font-medium text-gray-700 dark:bg-gray-800  dark:text-gray-400">
            <ul className="-mb-px flex flex-wrap">
              <li className="mr-2">
                <Link
                  href={`/users/${uid}/${username}/?filter=questions`}
                  className={`inline-block rounded-t-lg border-b-2 p-4 ${
                    filter === "questions"
                      ? " border-blue-700  text-blue-700 dark:border-blue-500 dark:text-blue-500 "
                      : " border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300 "
                  }  `}
                >
                  Questions
                </Link>
              </li>
              <li className="mr-2">
                <Link
                  href={`/users/${uid}/${username}/?filter=answers`}
                  className={`active inline-block rounded-t-lg border-b-2 p-4 ${
                    filter === "answers"
                      ? " border-blue-600  text-blue-600 dark:border-blue-500 dark:text-blue-500 "
                      : " border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300 "
                  }  `}
                  aria-current="page"
                >
                  Answers
                </Link>
              </li>
              <li className="mr-2">
                <Link
                  href={`/users/${uid}/${username}/?filter=replies`}
                  className={`inline-block rounded-t-lg border-b-2 p-4 ${
                    filter === "replies"
                      ? " border-blue-600  text-blue-600 dark:border-blue-500 dark:text-blue-500 "
                      : " border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300 "
                  } `}
                >
                  Replies
                </Link>
              </li>
            </ul>
          </div>

          {["questions", "answers", "replies"].includes(filter) ? (
            (filter === "questions" && (
              <UserQuestions userData={data.userData} />
            )) ||
            (filter === "answers" && (
              <UserAnswers userData={data.userData} />
            )) ||
            (filter === "replies" && <UserReplies />)
          ) : (
            <p>Invalid search</p>
          )}
        </section>
      )}
    </main>
  );
};

export default UserPage;

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
    <Link href={`/questions/${answer.questionUid}/${answer.questionId}`}>
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
        <Preview mrkdwnVal={answer.detail} />
      </div>
    </Link>
  );
};

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
    <Link href={`/questions/${reply.questionUid}/${reply.questionId}`}>
      <div
        id={reply.id}
        className="max-h-60 w-full overflow-hidden rounded-md bg-white px-4 py-2 pb-4 shadow-md outline outline-1 outline-zinc-200 hover:max-h-fit hover:scale-[1.01] hover:shadow-lg hover:transition-all hover:duration-200 dark:bg-gray-800 dark:outline-gray-700 dark:hover:shadow-black/40"
      >
        <div className="flex flex-col justify-between gap-6 border-gray-200 py-4 dark:border-gray-600 md:flex-row">
          <div className="px-2">
            <span className="break-words text-sm">{reply.reply}</span>
          </div>
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
    </Link>
  );
};
