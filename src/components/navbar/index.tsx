import { Avatar, DarkThemeToggle, Flowbite } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useState } from "react";
import { HiMenuAlt2 } from "react-icons/hi";
import SignOutButton from "./SignoutButton";
import Loading from "./Loading";
import { ThemeContext } from "@context/ThemeContext";
import { UserCtx } from "@context/UserContext";
import { getInitials } from "@utils/index";

type NavbarProps = {
  setMobileSidebar: React.Dispatch<React.SetStateAction<boolean>>;
};

function Navbar({ setMobileSidebar }: NavbarProps) {
  const [dropDown, setDropdown] = useState(false);

  const { setTheme } = useContext(ThemeContext);
  const { userData } = useContext(UserCtx);

  const showDropdown = () => {
    setDropdown(true);
  };

  const hideDropdown = () => {
    setDropdown(false);
  };

  const changeTheme = () => {
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme) setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="relative shadow-md">
      <Loading />
      <nav className="border-gray-200 bg-white px-3 py-2 dark:bg-gray-800 ">
        <div className="mx-auto flex flex-wrap items-center justify-between">
          <div className="flex flex-row">
            <div
              className="my-auto pr-2 lg:hidden"
              onClick={() => setMobileSidebar((old) => !old)}
            >
              <button
                data-collapse-toggle="navbar-default"
                type="button"
                className="inline-flex items-center rounded-lg p-[10px] text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                aria-controls="navbar-default"
                aria-expanded="false"
              >
                <span className="sr-only">Open mobile menu</span>
                <HiMenuAlt2 className="h-5 w-5" />
              </button>
            </div>
            <Link
              href={"/"}
              className="rounded-lg focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600"
            >
              <div className="cursor-pointer self-center whitespace-nowrap rounded-lg py-2 px-4 text-xl font-semibold text-gray-900  hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
                Overflow
              </div>
            </Link>
          </div>
          <div className="flex gap-4 md:order-2">
            <div onClick={changeTheme}>
              <Flowbite>
                <DarkThemeToggle />
              </Flowbite>
            </div>
            <div className="relative">
              <button
                id="dropdownUserAvatarButton"
                onMouseEnter={showDropdown}
                className="flex rounded-lg text-sm "
                type="button"
              >
                <span className="sr-only">Open user menu</span>
                {userData.displayName ? (
                  <div className="my-auto h-10 w-10 overflow-clip rounded-lg focus:ring-2 focus:ring-gray-300 focus:ring-offset-4 dark:focus:ring-gray-600">
                    <Image
                      src={
                        !userData.photoURL || userData.photoURL === ""
                          ? `https://dummyimage.com/400x400/000/fff.jpg&text=${getInitials(
                              userData.displayName
                            ).join("")}`
                          : userData.photoURL
                      }
                      alt="user photo"
                      width="45"
                      height="45"
                    />
                  </div>
                ) : (
                  <Avatar
                    alt="user photo"
                    rounded={true}
                    bordered={true}
                    placeholderInitials={"🗿"}
                  />
                )}
              </button>

              <div
                onMouseEnter={showDropdown}
                onMouseLeave={hideDropdown}
                style={{
                  animation: dropDown
                    ? "dropdownopen 300ms ease-out"
                    : "dropdownclose 300ms ease-in forwards",
                }}
                id="dropdownAvatar"
                className={`absolute right-0 top-14 z-10 w-44 divide-y divide-gray-100 rounded-lg bg-white shadow-lg outline outline-1 outline-zinc-200 dark:divide-gray-700 dark:bg-gray-800 dark:outline-zinc-700`}
              >
                {userData.email && (
                  <div className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    <span className="text-lg">{userData.displayName}</span>
                    <div className="truncate font-medium">
                      @{userData.email.split("@")[0]}
                    </div>
                  </div>
                )}
                <div className="p-2">
                  {userData.email ? (
                    <span onClick={hideDropdown}>
                      <SignOutButton />
                    </span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href={"/sign-in"}>
                        <div
                          onClick={hideDropdown}
                          className="flex w-full cursor-pointer flex-row items-center rounded-md px-4 py-1 text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          Sign In
                        </div>
                      </Link>
                      <Link href={"/sign-up"}>
                        <div
                          onClick={hideDropdown}
                          className="flex w-full cursor-pointer flex-row items-center rounded-md px-4 py-1 text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          Sign Up
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
