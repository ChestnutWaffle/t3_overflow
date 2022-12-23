import Link from "next/link";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface PaginationProps {
  page: number;
  total_pages: number;
  base: string;
}

function Pagination({ page, total_pages, base }: PaginationProps) {
  return (
    <div className="flex justify-between py-4">
      <Link
        href={
          page === 2 || page === 1
            ? base
            : "?page=" + (page <= 1 ? 1 : Number(page) - 1)
        }
        className="rounded-full"
      >
        <button
          type="button"
          disabled={page <= 1}
          className={` ${
            page <= 1 ? "cursor-not-allowed" : "cursor-pointer"
          } inline-flex items-center gap-4 rounded-full p-2.5 text-center text-sm font-medium text-blue-700 hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800`}
        >
          <FaArrowLeft />
          <span className="sr-only">Previous Page</span>
        </button>
      </Link>
      <Link
        href={"?page=" + (page >= total_pages ? total_pages : Number(page) + 1)}
        className="rounded-full"
      >
        <button
          type="button"
          disabled={page >= total_pages}
          className={` ${
            page >= total_pages ? "cursor-not-allowed" : "cursor-pointer"
          } inline-flex items-center gap-4 rounded-full p-2.5 text-center text-sm font-medium text-blue-700 hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800`}
        >
          <FaArrowRight />
          <span className="sr-only">Next Page</span>
        </button>
      </Link>
    </div>
  );
}

export default Pagination;
