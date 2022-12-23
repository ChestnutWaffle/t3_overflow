import type { Question } from "@types-local/defined-types";
import { getInitials } from "@utils/.";
import Image from "next/image";
import Link from "next/link";
import Tags from "./Tags";

interface PostProp {
  question: Question;
}

export default function Post({ question }: PostProp) {
  return (
    <div className="w-full rounded-md bg-white px-4 py-2 shadow-md outline outline-1 outline-zinc-200 hover:scale-[1.01] hover:shadow-lg dark:bg-gray-800 dark:outline-gray-700 dark:hover:shadow-black/40">
      <Link href={`/questions/${question.uid}/${question.id}`}>
        <h3 className="cursor-pointer break-words text-xl font-bold text-gray-700 hover:text-black dark:text-gray-200 dark:hover:text-white">
          {question.title.length > 150
            ? question.title.substring(0, 150) + "..."
            : question.title}
        </h3>
      </Link>
      <div className="flex flex-row flex-wrap justify-between gap-4 py-4 text-gray-900 dark:text-gray-100">
        <Tags tags={question.tags} />
        <div className="ml-auto flex flex-col">
          <Link href={`/users/${question.uid}/${question.user.username}`}>
            <div className="flex cursor-pointer justify-between py-2">
              <div className="h-6 w-6 overflow-hidden rounded-md">
                <Image
                  src={
                    question.user.photoURL === ""
                      ? `https://dummyimage.com/400x400/000/fff.jpg&text=${getInitials(
                          question.user.displayName
                        ).join("+")}`
                      : question.user.photoURL
                  }
                  width="24"
                  height="24"
                  alt={question.user.username}
                />
              </div>
              <span className="text-md ml-2 text-right font-semibold text-blue-700 underline-offset-2 hover:underline dark:text-blue-500">
                {question.user.displayName}
              </span>
            </div>
          </Link>
          <span className="text-right">{`asked ${question.createdAt}`}</span>
        </div>
      </div>
    </div>
  );
}

export const PostSkeleton = () => {
  return (
    <div className="min-h-[132px] w-full rounded-md bg-white px-4 py-2 shadow-md outline outline-1 outline-zinc-200 hover:shadow-lg dark:bg-gray-800 dark:outline-gray-700">
      <div className="h-7 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-600"></div>
      <div className="flex flex-row flex-wrap justify-between gap-4 py-4 text-gray-900 dark:text-gray-100">
        <div className="flex flex-row gap-2">
          <div className="h-6 w-8 animate-pulse rounded-md bg-gray-200 dark:bg-gray-600"></div>
          <div className="h-6 w-8 animate-pulse rounded-md bg-gray-200 dark:bg-gray-600"></div>
          <div className="h-6 w-8 animate-pulse rounded-md bg-gray-200 dark:bg-gray-600"></div>
        </div>
        <div className="ml-auto flex flex-col">
          <div className="flex cursor-pointer justify-between py-2">
            <div className="h-6 w-6 animate-pulse overflow-hidden rounded-md bg-gray-200 dark:bg-gray-600"></div>
            <span className=" ml-2 h-6 w-48 animate-pulse rounded-md bg-gray-200 dark:bg-gray-600 "></span>
          </div>
          <span className="h-6 w-56 animate-pulse rounded-md bg-gray-200 dark:bg-gray-600"></span>
        </div>
      </div>
    </div>
  );
};
