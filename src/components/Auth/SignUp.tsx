import Link from "next/link";
import { useState, useContext } from "react";

import { BiErrorCircle } from "react-icons/bi";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineUser,
} from "react-icons/ai";
import { HiOutlineMail } from "react-icons/hi";

import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "@utils/trpc";
import { UserCtx } from "@context/UserContext";
import { ThemeContext } from "@context/ThemeContext";
import { createAuthUserEmail } from "@utils/firebase";
import useGlobalLoading from "@hooks/useGlobalLoading";

import HelperText from "./HelperText";
import GoogleBtn from "./GoogleBtn";
import { FirebaseError } from "firebase/app";
import { useCustomToast } from "@hooks/useCustomToast";
import { parseAuthErrCode } from "@utils/firebase/autherror";

type RegisterForm = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const schema = z
  .object({
    displayName: z
      .string()
      .min(1, "Name is required")
      .min(6, "Name is too short.")
      .trim(),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Email is not valid format."),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 letters.")
      .max(32, "Password must not be more than 32 letters."),
    confirmPassword: z
      .string()
      .min(1, "Confirm Password is required")
      .min(6, "Confirm Password must be at least 6 letters.")
      .max(32, "Confirm Password must not be more than 32 letters."),
  })
  .required();

const SignUp = () => {
  const { updateCtx } = useContext(UserCtx);
  const { theme } = useContext(ThemeContext);
  const { toast } = useCustomToast();

  const [viewPassword, setViewPassword] = useState<boolean>(false);
  const [viewConfirmPassword, setViewConfirmPassword] =
    useState<boolean>(false);

  const { setGlobalLoading } = useGlobalLoading();
  const [submitBtnLoading, setSubmitBtnLoading] = useState<boolean>(false);

  const emailSignUpMutation = trpc.auth.emailSignUp.useMutation({
    onSuccess: (data) => {
      updateCtx(data);
    },
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    criteriaMode: "all",
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const emailRegister = async (data: RegisterForm) => {
    setSubmitBtnLoading(true);
    setGlobalLoading(true);
    const { email, password, displayName } = data;
    try {
      const response = await createAuthUserEmail(email, password);
      setGlobalLoading(false);
      await emailSignUpMutation.mutateAsync({
        user: JSON.stringify(response.user),
        displayName,
      });
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e);
        toast({
          title: parseAuthErrCode(e.code),
          variant: "error",
        });
      }
      setSubmitBtnLoading(false);
    }
  };

  return (
    <section className=" w-full">
      <div className="mx-auto flex flex-col items-center justify-center px-6 lg:min-w-[500px] lg:py-6">
        <div className="w-full rounded-lg bg-white shadow-lg dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0">
          <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-600 dark:text-white md:text-2xl">
              Create an account
            </h1>
            <form
              className="space-y-4 md:space-y-6"
              onSubmit={handleSubmit(emailRegister)}
              style={{ colorScheme: theme || "light" }}
            >
              <div>
                <label
                  htmlFor="displayName"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Full Name
                </label>
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <AiOutlineUser className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                  </div>
                  <input
                    type="text"
                    id="displayName"
                    className={`block w-full rounded-lg border border-gray-600 bg-gray-50 p-2.5 pl-10 font-medium text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm ${
                      errors.email &&
                      "border-red-500 text-red-900 placeholder-red-700/70 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:text-red-500 dark:placeholder-red-500/80 dark:focus:border-red-500 dark:focus:ring-red-500"
                    }`}
                    placeholder="John Snow"
                    {...register("displayName")}
                  />
                </div>
                <ErrorMessage
                  errors={errors}
                  name="displayName"
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
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <HiOutlineMail className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    className={`block w-full rounded-lg border border-gray-600 bg-gray-50 p-2.5 pl-10 font-medium text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm ${
                      errors.email &&
                      "border-red-500 text-red-900 placeholder-red-700/70 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:text-red-500 dark:placeholder-red-500/80 dark:focus:border-red-500 dark:focus:ring-red-500"
                    }`}
                    placeholder="johnsnow@targaryen.com"
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
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
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
                    id="password"
                    placeholder="••••••••"
                    className={`block w-full rounded-lg border border-gray-600 bg-gray-50 p-2.5 pl-10 font-medium text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm ${
                      errors.password &&
                      "border-red-500 text-red-900 placeholder-red-700/70 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:text-red-500 dark:placeholder-red-500/80 dark:focus:border-red-500 dark:focus:ring-red-500"
                    }`}
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
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Confirm password
                </label>
                <div className="relative mb-2">
                  <div
                    onClick={() => setViewConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 left-0 flex cursor-pointer items-center pl-3"
                  >
                    {viewConfirmPassword ? (
                      <AiOutlineEye className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                    ) : (
                      <AiOutlineEyeInvisible className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                    )}
                  </div>
                  <input
                    type={viewConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="••••••••"
                    className={`block w-full rounded-lg border border-gray-600 bg-gray-50 p-2.5 pl-10 font-medium text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm ${
                      errors.password &&
                      "border-red-500 text-red-900 placeholder-red-700/70 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:text-red-500 dark:placeholder-red-500/80 dark:focus:border-red-500 dark:focus:ring-red-500"
                    }`}
                    {...register("confirmPassword")}
                  />
                </div>
                {watch("password") !== watch("confirmPassword") ? (
                  <HelperText
                    type="error"
                    icon={BiErrorCircle}
                    message={"Passwords don't match"}
                  />
                ) : null}
                <ErrorMessage
                  errors={errors}
                  name="confirmPassword"
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

              <button
                disabled={watch("password") !== watch("confirmPassword")}
                type="submit"
                className={`w-full rounded-lg ${
                  watch("password") !== watch("confirmPassword")
                    ? "cursor-not-allowed bg-blue-400 dark:bg-blue-500"
                    : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                }  px-5 py-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800`}
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
                  <span>Create an Account</span>
                )}
              </button>
              <GoogleBtn />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
