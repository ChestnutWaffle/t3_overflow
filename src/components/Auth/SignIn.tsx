import Link from "next/link";
import { useState, useContext } from "react";

import { BiErrorCircle } from "react-icons/bi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { HiOutlineMail } from "react-icons/hi";

import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { emailSignIn } from "@utils/firebase";
import { trpc } from "@utils/trpc";
import { UserCtx } from "@context/UserContext";
import useGlobalLoading from "@hooks/useGlobalLoading";
import { ThemeContext } from "@context/ThemeContext";
import { useCustomToast } from "@hooks/useCustomToast";
import { parseAuthErrCode } from "@utils/firebase/autherror";

import GoogleBtn from "./GoogleBtn";
import HelperText from "./HelperText";

type LoginForm = {
  email: string;
  password: string;
};

interface FirebaseError extends Error {
  readonly code: string;
  customData?: Record<string, unknown> | undefined;
  readonly name: string;
}

const schema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required.")
      .email("Email is not valid format."),
    password: z
      .string({ required_error: "Password is required." })
      .min(1, "Password is required.")
      .min(6, "Password must be at least 6 letters.")
      .max(32, "Password must not be more than 32 letters."),
  })
  .required();

const SignIn = () => {
  const { updateCtx } = useContext(UserCtx);
  const { theme } = useContext(ThemeContext);
  const { toast } = useCustomToast();

  const [viewPassword, setViewPassword] = useState<boolean>(false);
  const [submitBtnLoading, setSubmitBtnLoading] = useState<boolean>(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    criteriaMode: "all",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { setGlobalLoading } = useGlobalLoading();

  const userDataMutation = trpc.auth.userDataUid.useMutation({
    onSuccess: (data) => {
      updateCtx(data);
    },
  });

  const emailLogin = async (data: LoginForm) => {
    setSubmitBtnLoading(true);
    setGlobalLoading(true);
    const { email, password } = data;
    try {
      const response = await emailSignIn(email, password);
      setGlobalLoading(false);
      userDataMutation.mutate({ uid: response.user.uid });
    } catch (e) {
      const error = e as FirebaseError;
      toast({
        title: parseAuthErrCode(error.code),
        variant: "error",
      });
      setSubmitBtnLoading(false);
    }
  };

  return (
    <section className="w-full">
      <div className="mx-auto flex flex-col items-center justify-center px-6 lg:min-w-[500px] lg:py-0">
        <div className="w-full rounded-lg bg-white shadow-lg dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0">
          <div className="space-y-6 p-4 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-600 dark:text-white md:text-2xl">
              Sign in to your account
            </h1>
            <form
              className="space-y-4 md:space-y-6"
              onSubmit={handleSubmit(emailLogin)}
              style={{ colorScheme: theme || "light" }}
            >
              <div>
                <label
                  htmlFor="sign-in-email"
                  className={`mb-2 block text-sm font-medium text-gray-900 dark:text-white ${
                    errors.email && "text-red-700 dark:text-red-500"
                  }`}
                >
                  Your email
                </label>
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <HiOutlineMail className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                  </div>
                  <input
                    type="text"
                    id="sign-in-email"
                    className={`block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10  text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm ${
                      errors.email &&
                      "border-red-500 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:focus:border-red-500 dark:focus:ring-red-500"
                    }`}
                    placeholder="example@mail.com"
                    {...register("email")}
                  />
                </div>
                <ErrorMessage
                  errors={errors}
                  name="email"
                  render={({ messages }) =>
                    messages &&
                    Object.entries(messages).map(([type, message]) => (
                      <HelperText
                        key={type}
                        type="error"
                        icon={BiErrorCircle}
                        message={message}
                      />
                    ))
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="sign-in-password"
                  className={`mb-2 block text-sm font-medium text-gray-900 dark:text-white ${
                    errors.password && "text-red-700 dark:text-red-500"
                  }`}
                >
                  Password
                </label>
                <div className="relative mb-2">
                  <div
                    onClick={() => setViewPassword((prev) => !prev)}
                    className="absolute inset-y-0 left-0 flex cursor-pointer items-center pl-3"
                  >
                    {viewPassword ? (
                      <AiOutlineEye className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                    ) : (
                      <AiOutlineEyeInvisible className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                    )}
                  </div>
                  <input
                    type={viewPassword ? "text" : "password"}
                    id="sign-in-password"
                    className={`block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm  ${
                      errors.password &&
                      "border-red-500 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:focus:border-red-500 dark:focus:ring-red-500"
                    }`}
                    placeholder="••••••••"
                    {...register("password")}
                  />
                </div>
                <ErrorMessage
                  errors={errors}
                  name="password"
                  render={({ messages }) =>
                    messages &&
                    Object.entries(messages).map(([type, message]) => (
                      <HelperText
                        key={type}
                        type="error"
                        icon={BiErrorCircle}
                        message={message}
                      />
                    ))
                  }
                />
              </div>
              <div className="flex items-center justify-end">
                <a
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:underline hover:underline-offset-2 focus:underline focus:underline-offset-2 focus:ring-0 focus:ring-transparent dark:text-blue-500"
                >
                  Forgot password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300  dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                {submitBtnLoading ? (
                  <div role="status">
                    <svg
                      className=" inline h-4 w-4 animate-spin fill-white text-transparent"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                    <span className="sr-only">Loading...</span>
                  </div>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
              <GoogleBtn />
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don’t have an account yet?{" "}
                <Link
                  href="/sign-up"
                  className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
