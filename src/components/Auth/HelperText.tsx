import type { IconType } from "react-icons";
import type { ValidateResult } from "react-hook-form";

const colors = {
  success: "text-green-600 dark:text-green-500",
  error: "text-red-600 dark:text-red-500",
};

export type HelperTextType = {
  type: "success" | "error";
  message: ValidateResult;
  icon: IconType;
};

const HelperText = ({ type, message, icon: Icon }: HelperTextType) => {
  const typeStyle = colors[type];
  // console.log({ type, message });
  return (
    <>
      {typeof message === "string" && (
        <p
          className={`mt-2 text-sm ${typeStyle} flex flex-row items-center justify-start`}
        >
          <Icon className="mr-2 inline h-5 w-5 text-lg" />
          <span>{message}</span>
        </p>
      )}
      {
        Array.isArray(message) && (
          <p
            className={`mt-2 text-sm ${typeStyle} flex flex-row items-center justify-start`}
          >
            <Icon className="mr-2 inline h-5 w-5 text-lg" />
            <span>{message[0]}</span>
          </p>
        )
        // message.map((msg, index) => (
        //   <p
        //   key
        //   className={`mt-2 text-sm ${typeStyle} flex flex-row items-center justify-start`}
        // >
        //   <Icon className="mr-2 inline h-5 w-5 text-lg" />
        //   <span>{msg}</span>
        // </p>
        // ))
      }
    </>
  );
};

export default HelperText;
