import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@hookform/error-message";
import HelperText from "@comp/Auth/HelperText";
import { BiErrorCircle } from "react-icons/bi";
import { useTheme } from "@context/ThemeContext";
import { trpc } from "@utils/trpc";
import { useUser } from "@context/UserContext";
import { useCustomToast } from "@hooks/useCustomToast";
import { useState } from "react";

const Editor = dynamic(
  () => import("../Markdown/Editor").then((mod) => mod.default),
  {
    loading: ({}) => <p>Loading...</p>,
  }
);

type AnswerFormType = {
  detail: string;
};

const schema = z
  .object({
    detail: z
      .string()
      .min(25, "Answer is too short.")
      .max(10000, "Answer is too big"),
  })
  .required();

type AnswerFormProps = {
  parentUid: string;
  questionId: string;
};

const AnswerForm = ({ parentUid, questionId }: AnswerFormProps) => {
  const { theme } = useTheme();
  const user = useUser();
  const { toast } = useCustomToast();
  const [isDisabled, setIsDisabled] = useState(false);
  const utils = trpc.useContext();

  const {
    register,
    watch,
    setValue,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm<AnswerFormType>({
    resolver: zodResolver(schema),
    criteriaMode: "all",
    defaultValues: {
      detail: "",
    },
  });

  const answerMutation = trpc.answer.create.useMutation({
    onSuccess: async (data) => {
      await utils.answer.read.invalidate({ questionId, uid: parentUid });
      reset();
      toast({ title: data.message, variant: "success" });
      setIsDisabled(false);
    },
  });

  const setDetail = (detail: string) => {
    setValue("detail", detail, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const addAnswer = async (data: AnswerFormType) => {
    setIsDisabled(true);
    const { detail } = data;
    if (user.userData.uid) {
      await answerMutation.mutateAsync({
        detail,
        uid: user.userData.uid,
        parentUid,
        questionId,
      });
    } else {
      toast({
        variant: "error",
        title: "No user currently logged in. Try again after logging in",
      });
    }
  };

  const detail = register("detail");

  return (
    <div className="my-4 rounded-md bg-white p-4 shadow-lg outline outline-1 outline-zinc-200 dark:bg-gray-800 dark:shadow-black/50 dark:outline-gray-700">
      <form
        onSubmit={handleSubmit(addAnswer)}
        style={{ colorScheme: theme || "light" }}
      >
        <div className="mb-6 ">
          <label
            htmlFor="details"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Add an Answer
          </label>
          <Editor
            name={detail.name}
            id="details"
            value={watch("detail")}
            onChange={setDetail}
            mrkRef={detail.ref}
            onBlur={detail.onBlur}
            editorSize={150}
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
          Post Answer
        </button>
      </form>
    </div>
  );
};

export default AnswerForm;
