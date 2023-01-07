import dynamic from "next/dynamic";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TagInput from "@comp/General/TagInput";
import { ErrorMessage } from "@hookform/error-message";
import HelperText from "@comp/Auth/HelperText";
import { BiErrorCircle } from "react-icons/bi";
import { useTheme } from "@context/ThemeContext";
import { useUser } from "@context/UserContext";
import { trpc } from "@utils/trpc";
import { useCustomToast } from "@hooks/useCustomToast";
import { useState } from "react";
import { useRouter } from "next/router";

const Editor = dynamic(
  () => import("../Markdown/Editor").then((mod) => mod.default),
  {
    loading: () => <p>Loading...</p>,
  }
);

type CreateQuestion = {
  question: string;
  tags: string[];
  detail: string;
};

const schema = z
  .object({
    question: z
      .string()
      .min(1, "This field is required.")
      .min(50, "Please be more descriptive, (Atleast 50 characters).")
      .max(250, "Please keep your question short."),
    tags: z
      .array(
        z
          .string()
          .min(1, "Tag is too short")
          .trim()
          .max(15, "A tag cannot be that long")
      )
      .min(1, "Atleast one tag is required")
      .max(5, "Maximum of 5 Tags is allowed"),
    detail: z
      .string()
      .min(300, "Explanation of the question is too short.")
      .max(10000, "Explanation too big"),
  })
  .required();

const Create = () => {
  const { theme } = useTheme();
  const user = useUser();
  const { toast } = useCustomToast();
  const [isDisabled, setIsDisabled] = useState(false);
  const router = useRouter();

  const {
    register,
    watch,
    setValue,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm<CreateQuestion>({
    resolver: zodResolver(schema),
    criteriaMode: "all",
    defaultValues: {
      question: "",
      tags: [],
      detail: "",
    },
  });

  const questionMutation = trpc.question.create.useMutation({
    onSuccess: (data) => {
      reset();
      toast({ title: "Question successfully created!", variant: "success" });
      setIsDisabled(false);
      router.push(`/questions/${data.questionUid}/${data.questionId}`);
    },
  });

  const createQuestion = async (data: CreateQuestion) => {
    setIsDisabled(true);
    const { detail, question, tags } = data;
    if (user.userData.uid) {
      await questionMutation.mutateAsync({
        detail,
        question,
        tags,
        uid: user.userData.uid,
      });
    } else {
      toast({
        variant: "error",
        title: "No user currently logged in. Try again after logging in",
      });
    }
  };

  const setTags = (tags: string[]) => {
    setValue("tags", tags, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const setDetail = (detail: string) => {
    setValue("detail", detail, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const detail = register("detail");

  return (
    <main className="flex-1 p-4">
      <Head>
        <title>Ask a Question</title>
      </Head>
      <div className=" flex flex-col  gap-4 rounded-lg  bg-white p-8 shadow-lg dark:bg-gray-800">
        <form
          onSubmit={handleSubmit(createQuestion)}
          style={{ colorScheme: theme || "light" }}
        >
          <div className="mb-6" title="Question">
            <label
              htmlFor="large-input"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Question
            </label>
            <input
              {...register("question")}
              type="text"
              id="large-input"
              disabled={isDisabled}
              className="sm:text-md block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />
            <ErrorMessage
              errors={errors}
              name="question"
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
          <div className="mb-6" title="Tags">
            {/* <label
              htmlFor="base-input"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Tags
            </label>
            <input
              {...register("tags")}
              type="text"
              id="base-input"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            /> */}
            <TagInput
              tags={watch("tags")}
              setTags={setTags}
              disabled={isDisabled}
            />
            <ErrorMessage
              errors={errors}
              name="tags"
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
          <div className="mb-6 ">
            <label
              htmlFor="details"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Detail
            </label>
            <Editor
              name={detail.name}
              id="details"
              value={watch("detail")}
              onChange={setDetail}
              mrkRef={detail.ref}
              onBlur={detail.onBlur}
            />
            <ErrorMessage
              errors={errors}
              name="detail"
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
            disabled={isDisabled}
            type="submit"
            className="mr-2 mb-2 rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
          >
            Ask Question
          </button>
        </form>
      </div>
    </main>
  );
};

export default Create;
