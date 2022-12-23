import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { trpc } from "@utils/trpc";

const UserPage: NextPage = () => {
  const router = useRouter();

  const { uid, username } = router.query;

  if (!uid || !username) return null;

  const userPageData = trpc.mock.userPage.useQuery({
    uid: uid.toString(),
    username: username.toString(),
  });

  const data = userPageData.data;

  if (!data) return null;

  const { user } = data;

  return (
    <>
      <Head>
        <title>Username</title>
      </Head>
      <main className="pt-6 pb-0 text-gray-700 dark:text-gray-300 sm:px-8 sm:pb-6 ">
        <section className="mt-[150px] min-h-[1000px] border border-zinc-200 bg-white px-4 py-2  shadow-md dark:border-gray-700 dark:bg-gray-800 sm:rounded-md">
          <header className="flex flex-col items-center justify-center gap-2 md:flex-row md:justify-start">
            <div className="-mt-[125px] flex items-center px-4">
              <Image
                className="rounded-md"
                src={`${user.photo_URL}`}
                width="200"
                height="200"
                alt={user.username}
              />
            </div>

            <span className="text-center text-3xl font-semibold sm:text-4xl md:text-start ">
              {user.firstname} {user.lastname}
            </span>
          </header>
        </section>
      </main>
    </>
  );
};

export default UserPage;
