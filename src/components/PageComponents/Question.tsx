import type { ReplyResult } from "@types-local/defined-types";
import Preview from "@comp/Markdown/Preview";

import {
  AiOutlineLike,
  AiFillLike,
} from "react-icons/ai";
import Image from "next/image";
import Link from "next/link";
import { getInitials } from "@utils/index";
import Tags from "./Tags";
import { trpc } from "@utils/trpc";
import { useUser } from "@context/UserContext";
import { useState } from "react";
import { kebabCase } from "lodash";

interface QuestionProps {
  questionData: {
    upvote: boolean;
    downvote: boolean;
    createdAt: string;
    updatedAt: string;
    replies: ReplyResult[];
    user: {
      displayName: string;
      username: string;
      photoURL: string;
    };
    detail: string;
    tags?: string[];
    likes: number;
    title?: string;
    uid: string;
    id: string;
  };
}

export const Question = ({ questionData }: QuestionProps) => {
  const { userData } = useUser();
  const utils = trpc.useContext();
  const [replyVal, setReplyVal] = useState("");

  const upvoteMutation = trpc.question.vote.upvote.useMutation({
    onSuccess() {
      utils.question.invalidate({
        questionId: questionData.id,
        uid: questionData.uid,
      });
    },
  });
  const downvoteMutation = trpc.question.vote.downvote.useMutation({
    onSuccess() {
      utils.question.invalidate({
        questionId: questionData.id,
        uid: questionData.uid,
      });
    },
  });

  const replyMutation = trpc.question.reply.create.useMutation({
    onSuccess() {
      utils.question.invalidate({
        questionId: questionData.id,
        uid: questionData.uid,
      });
    },
  });

  const upvote = async () => {
    await upvoteMutation.mutateAsync({
      parentUid: questionData.uid,
      questionId: questionData.id,
      uid: userData.uid || "",
    });
  };

  const downvote = async () => {
    await downvoteMutation.mutateAsync({
      parentUid: questionData.uid,
      questionId: questionData.id,
      uid: userData.uid || "",
    });
  };

  const addReply = async () => {
    if (replyVal.length > 5) {
      await replyMutation.mutateAsync({
        parentUid: questionData.uid,
        questionId: questionData.id,
        reply: replyVal,
        uid: userData.uid || "",
        displayName: userData.displayName || "",
        username: kebabCase(userData.displayName || ""),
      });
    }
    setReplyVal("");
  };

  return (
    <div className="rounded-md bg-white pt-4 pb-10 shadow-lg outline outline-1 outline-zinc-200 dark:bg-gray-800 dark:shadow-black/50 dark:outline-gray-700">
      <div className="flex flex-col gap-4 pt-2 md:flex-row">
        <div className="mx-2 flex flex-row items-center gap-2 p-2 text-center md:mr-0">
          <button
            type="button"
            onClick={upvote}
            className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {questionData.upvote ? (
              <AiFillLike className="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
            ) : (
              <AiOutlineLike className="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
            )}
            <span className="sr-only">Upvote</span>
          </button>
          <span className="text-lg font-medium">{questionData.likes}</span>
          <button
            type="button"
            onClick={downvote}
            className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {questionData.downvote ? (
              <AiFillLike className="h-5 w-5 rotate-180 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
            ) : (
              <AiOutlineLike className="h-5 w-5 rotate-180 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
            )}
            <span className="sr-only">Downvote</span>
          </button>
        </div>
        <div className="mx-6 flex flex-1 items-center md:ml-0">
          {questionData.title && (
            <Link href={`/questions/${questionData.id}`}>
              <h1 className="cursor-pointer break-words text-2xl font-semibold">
                {questionData.title}
              </h1>
            </Link>
          )}
        </div>
      </div>
      <div className="mt-8 px-6">
        <Preview mrkdwnVal={questionData.detail} />
      </div>

      <div className="my-4 mx-6 flex flex-wrap justify-between gap-2">
        <div className="flex place-content-center">
          {questionData.tags && <Tags tags={questionData.tags} />}
        </div>
        <div
          aria-label="user-section"
          className="ml-auto flex place-content-center "
        >
          <div className="my-2 ml-auto mr-2 flex w-fit flex-row flex-wrap items-center justify-between gap-2 text-right">
            <Link
              href={`/users/${questionData.uid}/${questionData.user.username}`}
            >
              <div className="h-8 w-8 overflow-hidden rounded-md">
                <Image
                  src={
                    questionData.user.photoURL === ""
                      ? `https://dummyimage.com/400x400/000/fff.jpg&text=${getInitials(
                          questionData.user.displayName
                        ).join("+")}`
                      : questionData.user.photoURL
                  }
                  width="32"
                  height="32"
                  alt={questionData.user.username}
                />
              </div>
            </Link>
            <div className="ml-4 flex flex-col">
              <Link
                href={`/users/${questionData.uid}/${questionData.user.username}`}
              >
                <span className="cursor-pointer text-base font-bold text-blue-700 underline-offset-2 hover:underline">
                  {questionData.user.displayName}
                </span>
              </Link>
              <span className="text-sm font-semibold ">
                {questionData.updatedAt}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full p-5">
        <div className="rounded-xl border-2 border-gray-200 p-2 dark:border-gray-600">
          <h3 className="ml-1 pb-2 text-sm font-bold uppercase text-gray-700 dark:text-gray-300">
            Replies
          </h3>
          <div>
            {questionData.replies?.map((reply) => {
              return <QuestionReply reply={reply} key={reply.id} />;
            })}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addReply();
            }}
          >
            <input
              type="text"
              placeholder="Enter your reply"
              value={replyVal}
              onChange={(e) => setReplyVal(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />
            <button
              type="submit"
              className="my-2 mr-2 rounded-lg border border-gray-200 bg-white py-2.5 px-5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
            >
              Add a Reply
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

interface ReplyProps {
  reply: ReplyResult;
}

export const QuestionReply = ({ reply }: ReplyProps) => {
  return (
    <div className="flex flex-col justify-between gap-6 border-t-2 border-gray-200 py-4 dark:border-gray-600 md:flex-row">
      <div className="px-2">
        <span className="break-words text-sm">{reply.reply}</span>
      </div>
      <div className="ml-auto mt-auto flex min-w-fit gap-2">
        <Link href={`/users/${reply.uid}/${reply.username}`}>
          <span className="text-md ml-2 font-semibold text-blue-700 underline-offset-2 hover:underline">
            {reply.displayName}
          </span>
        </Link>
        <span className="text-right">{reply.createdAt}</span>
      </div>
    </div>
  );
};
