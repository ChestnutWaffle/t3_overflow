import { Toast } from "flowbite-react";
import { toast as _toast } from "react-hot-toast";
import {
  HiCheck,
  HiOutlineExclamation,
  HiOutlineInformationCircle,
  HiOutlineX,
} from "react-icons/hi";
import { MdOutlineClose } from "react-icons/md";
import { useTheme } from "@context/ThemeContext";

const variants = {
  success: {
    className:
      "bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200",
    Icon: HiCheck,
  },
  warning: {
    className:
      "text-orange-500 bg-orange-100 dark:bg-orange-700 dark:text-orange-200",
    Icon: HiOutlineExclamation,
  },
  error: {
    className: "text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200",
    Icon: HiOutlineX,
  },
  info: {
    className: "text-blue-500 bg-blue-100 dark:bg-blue-800 dark:text-blue-200",
    Icon: HiOutlineInformationCircle,
  },
};

export function useCustomToast() {
  const { theme } = useTheme();

  function toast({
    title,
    variant,
  }: {
    title: string;
    variant: keyof typeof variants;
  }) {
    const { className, Icon } = variants[variant];

    return _toast.custom((t) => (
      <Toast
        style={{
          animation: t.visible
            ? "fadeInRight 300ms ease-out"
            : "fadeOutLeft 300ms ease-in forwards",
          border:
            theme === "dark" ? "0.5px solid #374151" : "0.5px solid #e4e4e7",
        }}
      >
        <div
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${className}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3 text-sm font-normal">{title}</div>
        <button
          onClick={() => _toast.dismiss(t.id)}
          type="button"
          className="-mx-1.5 -my-1.5 ml-auto inline-flex h-8 w-8 rounded-lg bg-white p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-gray-300 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-white"
          aria-label="Close"
        >
          <span className="sr-only">Close</span>
          <MdOutlineClose className="h-5 w-5 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white" />
        </button>
      </Toast>
    ));
  }

  return { toast };
}
