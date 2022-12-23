import { getInitials } from "@utils/index";
import Image from "next/image";
import Link from "next/link";

type UserItemProps = {
  user: {
    uid: string;
    displayName: string;
    photoURL: string;
    username: string;
  };
};

const UserItem = ({ user }: UserItemProps) => {
  return (
    <Link
      href={`/users/${user.uid}/${user.username}`}
      className="px-auto group flex flex-row items-center justify-start gap-3 rounded-md bg-gray-100 p-2 shadow-md hover:scale-[1.01] hover:shadow-lg active:scale-[1] dark:bg-slate-800 dark:shadow-black/40"
    >
      <div className="flex items-center justify-center">
        <Image
          className="rounded"
          src={
            user.photoURL === ""
              ? `https://dummyimage.com/400x400/000/fff.jpg&text=${getInitials(
                  user.displayName
                ).join("+")}`
              : user.photoURL
          }
          width={50}
          height={50}
          alt="user-image"
        />
      </div>
      <div className="flex flex-col">
        <span className="break-normal font-semibold text-gray-800 underline-offset-2 group-hover:text-blue-600 group-hover:underline dark:text-gray-100">
          {user.displayName}
        </span>
      </div>
    </Link>
  );
};

export default UserItem;

export const UserSkeleton = () => {
  return (
    <div className="px-auto group flex flex-row items-center justify-start gap-3 rounded-md bg-gray-100 p-2 shadow-md hover:scale-[1.01] hover:shadow-lg active:scale-[1] dark:bg-slate-800 dark:shadow-black/40">
      <div className="h-[50px] w-[50px] flex-shrink-0 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
      <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
    </div>
  );
};
