import Link from "next/link";
import { useRouter } from "next/router";
import type { IconType } from "react-icons";

type Props = {
  href: string;
  icon: IconType;
  label: string;
  exact: boolean;
};

function NavLink({ href, label, icon: Icon, exact }: Props) {
  const { pathname } = useRouter();

  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center rounded-lg p-1 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${
        isActive
          ? "bg-blue-700 text-white hover:bg-blue-600 dark:hover:bg-blue-600"
          : ""
      }`}
    >
      <>
        <Icon
          className={`mx-1 h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white ${
            isActive
              ? "text-gray-50 hover:text-white group-hover:text-gray-50 dark:text-gray-50 dark:hover:text-white dark:group-hover:text-gray-50"
              : " "
          }`}
        />
        <span className={`ml-3 font-semibold`}>{label}</span>
      </>
    </Link>
  );
}

export default NavLink;
