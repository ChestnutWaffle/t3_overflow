import type { ReplyResult } from "@types-local/defined-types";
import Preview from "@comp/Markdown/Preview";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import Image from "next/image";
import Link from "next/link";
import { getDateString, getInitials } from "@utils/index";
import { useUser } from "@context/UserContext";
import { trpc } from "@utils/trpc";
import { useState } from "react";
import { kebabCase } from "lodash";

interface PostProps {
  answerData: {
    upvote: boolean;
    downvote: boolean;
    createdAt: number;
    updatedAt: number;
    user: {
      displayName: string;
      username: string;
      photoURL: string;
    };
    detail: string;
    likes: number;
    uid: string;
    id: string;
  };
  questionId: string;
  parentUid: string;
}

export const Answer = ({ answerData, questionId, parentUid }: PostProps) => {
  return (
    <div className="rounded-md bg-white pt-4 pb-10 shadow-lg outline outline-1 outline-zinc-200 dark:bg-gray-800 dark:shadow-black/50 dark:outline-gray-700">
      <div className="flex flex-col gap-4 pt-2 md:flex-row">
        <AnswerLikes
          answerId={answerData.id}
          initData={{
            downvote: answerData.downvote,
            upvote: answerData.upvote,
            likes: answerData.likes,
          }}
          parentUid={parentUid}
          questionId={questionId}
        />
      </div>
      <div className="mt-8 px-6">
        <Preview mrkdwnVal={answerData.detail} />
      </div>

      <div className="my-4 mx-6 flex flex-wrap justify-between gap-2">
        <div
          aria-label="user-section"
          className="ml-auto flex place-content-center "
        >
          <div className="my-2 ml-auto mr-2 flex w-fit flex-row flex-wrap items-center justify-between gap-2 text-right">
            <Link href={`/users/${answerData.uid}/${answerData.user.username}`}>
              <div className="h-8 w-8 overflow-hidden rounded-md">
                <Image
                  src={
                    answerData.user.photoURL === ""
                      ? `https://dummyimage.com/400x400/000/fff.jpg&text=${getInitials(
                          answerData.user.displayName
                        ).join("+")}`
                      : answerData.user.photoURL
                  }
                  width="32"
                  height="32"
                  alt={answerData.user.username}
                />
              </div>
            </Link>
            <div className="ml-4 flex flex-col">
              <Link
                href={`/users/${answerData.uid}/${answerData.user.username}`}
              >
                <span className="cursor-pointer text-base font-bold text-blue-700 underline-offset-2 hover:underline">
                  {answerData.user.displayName}
                </span>
              </Link>
              <span className="text-sm font-semibold ">
                {getDateString(answerData.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full p-5">
        <AnswerReplies
          answerId={answerData.id}
          parentUid={parentUid}
          questionId={questionId}
        />
      </div>
    </div>
  );
};

type RepliesType = {
  parentUid: string;
  questionId: string;
  answerId: string;
};

const AnswerReplies = ({ parentUid, questionId, answerId }: RepliesType) => {
  const { userData } = useUser();
  const utils = trpc.useContext();

  const [replyVal, setReplyVal] = useState("");
  const [disabled, setDisabled] = useState(false);

  const { data } = trpc.answer.reply.read.useQuery({
    answerId,
    parentUid,
    questionId,
  });

  const replyMutation = trpc.answer.reply.create.useMutation({
    onSuccess(newData) {
      utils.answer.reply.read.setData(
        (oldData) => ({
          replies: [
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ...oldData!.replies,
            {
              ...newData,
            },
          ],
        }),
        {
          answerId,
          parentUid,
          questionId,
        }
      );
      setDisabled(false);
    },
  });

  const addReply = async () => {
    setDisabled(true);
    if (replyVal.length > 5)
      await replyMutation.mutateAsync({
        answerId,
        parentUid,
        questionId,
        reply: replyVal,
        uid: userData.uid || "",
        displayName: userData.displayName || "",
        username: kebabCase(userData.displayName || ""),
      });
    setReplyVal("");
  };

  return (
    <div className="rounded-xl border-2 border-gray-200 p-2 dark:border-gray-600">
      <h3 className="ml-1 pb-2 text-sm font-bold uppercase text-gray-700 dark:text-gray-300">
        Replies
      </h3>
      <div>
        {data?.replies.map((reply) => {
          return <AnswerReply reply={reply} key={reply.id} />;
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
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          onChange={(e) => setReplyVal(e.target.value)}
        />
        <button
          type="button"
          disabled={disabled}
          className="my-2 mr-2 rounded-lg border border-gray-200 bg-white py-2.5 px-5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
        >
          Add a Reply
        </button>
      </form>
    </div>
  );
};

interface ReplyProps {
  reply: ReplyResult;
}

export const AnswerReply = ({ reply }: ReplyProps) => {
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
        <span className="text-right">{getDateString(reply.createdAt)}</span>
      </div>
    </div>
  );
};

type AnswerLikesProps = {
  parentUid: string;
  questionId: string;
  answerId: string;
  initData: {
    upvote: boolean;
    downvote: boolean;
    likes: number;
  };
};

const AnswerLikes = ({
  parentUid,
  questionId,
  answerId,
  initData,
}: AnswerLikesProps) => {
  const { userData } = useUser();
  const utils = trpc.useContext();

  const { data } = trpc.answer.vote.read.useQuery(
    {
      answerId,
      questionId,
      uid: parentUid,
    },
    {
      initialData: {
        ...initData,
      },
    }
  );

  const upvoteMutation = trpc.answer.vote.upvote.useMutation({
    onSuccess(newData) {
      utils.answer.vote.read.setData(
        (oldData) => ({
          downvote: newData.downvote,
          upvote: newData.upvote,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          likes: oldData!.likes + newData.likesInc,
        }),
        {
          answerId,
          questionId,
          uid: parentUid,
        }
      );
    },
  });
  const downvoteMutation = trpc.answer.vote.downvote.useMutation({
    onSuccess(newData) {
      utils.answer.vote.read.setData(
        (oldData) => ({
          downvote: newData.downvote,
          upvote: newData.upvote,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          likes: oldData!.likes + newData.likesInc,
        }),
        {
          answerId,
          questionId,
          uid: parentUid,
        }
      );
    },
  });

  const upvote = async () => {
    await upvoteMutation.mutateAsync({
      parentUid,
      questionId,
      uid: userData.uid || "",
      answerId,
    });
  };

  const downvote = async () => {
    await downvoteMutation.mutateAsync({
      parentUid,
      questionId,
      uid: userData.uid || "",
      answerId,
    });
  };

  return (
    <div className="mx-2 flex flex-row items-center gap-2 p-2 text-center md:mr-0">
      <button
        type="button"
        onClick={upvote}
        className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {data?.upvote ? (
          <AiFillLike className="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
        ) : (
          <AiOutlineLike className="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
        )}
        <span className="sr-only">Upvote</span>
      </button>
      <span className="text-lg font-medium">{data?.likes}</span>
      <button
        type="button"
        onClick={downvote}
        className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {data?.downvote ? (
          <AiFillLike className="h-5 w-5 rotate-180 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
        ) : (
          <AiOutlineLike className="h-5 w-5 rotate-180 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
        )}
        <span className="sr-only">Downvote</span>
      </button>
    </div>
  );
};
