import type { NextPage } from "next";
import Link from "next/link";

const _404: NextPage = () => {
  return (
    <section className="flex h-[calc(100vh-60px)] items-center justify-center bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl py-8 px-4 lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-7xl font-extrabold tracking-tight text-blue-600 dark:text-blue-500 lg:text-9xl">
            404
          </h1>
          <p className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Page not Found
          </p>

          <Link
            href="/"
            className="my-4 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    </section>
  );
};

export default _404;
