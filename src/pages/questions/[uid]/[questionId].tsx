import { useRouter } from "next/router";
import { trpc } from "@utils/trpc";

import type { NextPage } from "next";
import Head from "next/head";
import { Question } from "@comp/PageComponents/Question";
import { Answer } from "@comp/PageComponents/Answer";
import { Fragment, useCallback, useEffect } from "react";
import { useUser } from "@context/UserContext";
import Link from "next/link";
import AnswerForm from "@comp/PageComponents/AnswerForm";
import { useInView } from "react-intersection-observer";

const QuestionPage: NextPage = () => {
  const router = useRouter();
  const { userData } = useUser();

  const { questionId, uid } = router.query;

  const question = trpc.question.read.useQuery({
    questionId: questionId as string,
    uid: uid as string,
  });

  const { data, hasNextPage, fetchNextPage, isLoading } =
    trpc.answer.read.useInfiniteQuery(
      { questionId: questionId as string, uid: uid as string },
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
    <main className="flex-1 p-2 text-gray-900 dark:text-gray-50 sm:m-4">
      <Head>
        <title>
          {question.isLoading
            ? "Loading..."
            : `${question.data?.title} - ${question.data?.user.displayName}`}
        </title>
      </Head>
      {question.isLoading
        ? "Question is Loading..."
        : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          question.data && <Question questionData={question.data} />}

      <h2 className="mt-8 mb-6 text-2xl font-bold uppercase">Answers</h2>
      {userData.emailVerified ? (
        <AnswerForm
          parentUid={uid as string}
          questionId={questionId as string}
        />
      ) : (
        <div className="my-4 rounded-md bg-white p-4 shadow-lg outline outline-1 outline-zinc-200 dark:bg-gray-800 dark:shadow-black/50 dark:outline-gray-700">
          <Link
            href="/sign-in"
            className="mr-2 cursor-pointer text-base font-bold text-blue-700 underline-offset-2 hover:underline"
          >
            Login
          </Link>
          and verify email to answer
        </div>
      )}
      <div className="mb-48 flex flex-col gap-6">
        {isLoading ? (
          "Answers are loading..."
        ) : (
          <div className="flex flex-col gap-4">
            {data?.pages.map((page, index) => (
              <Fragment key={index}>
                {page?.result.map((answer) => {
                  return (
                    <Answer
                      key={answer.id}
                      answerData={answer}
                      parentUid={uid as string}
                      questionId={questionId as string}
                    />
                  );
                })}
                {page?.result.length === 0 && (
                  <span className="text-xl font-semibold text-gray-500">
                    Be the first to Answer.
                  </span>
                )}
              </Fragment>
            ))}
          </div>
        )}
        {hasNextPage ? (
          <div className="-z-10 -mt-96 h-96 w-full" ref={ref}></div>
        ) : (
          !isLoading && (
            <p className="text-lg font-bold dark:text-gray-400">
              No more Answers
            </p>
          )
        )}
      </div>
    </main>
  );
};

export default QuestionPage;
