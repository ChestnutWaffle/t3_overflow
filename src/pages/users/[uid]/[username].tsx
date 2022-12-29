import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { trpc } from "@utils/trpc";
import _404 from "@pages/404";
import { getInitials } from "@utils/index";
import Link from "next/link";
import UserQuestions from "@comp/PageComponents/UserPage/Questions";
import UserAnswers from "@comp/PageComponents/UserPage/Answers";
import UserReplies from "@comp/PageComponents/UserPage/Replies";

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
                priority={true}
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
