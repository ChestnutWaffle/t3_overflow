import { useContext, useState } from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { UserCtx } from "@context/UserContext";
import { auth, verifyEmail } from "@utils/firebase";
import { trpc } from "@utils/trpc";
import { Sidebar as FlowSideBar } from "flowbite-react";

const EmailVerify = () => {
  const { updateCtx, userData } = useContext(UserCtx);

  const emailverifyMutation = trpc.auth.emailVerify.useMutation({
    onSuccess: (data) => {
      updateCtx(data);
    },
  });

  const checkVerified = async () => {
    await auth.currentUser?.reload();
    if (auth.currentUser?.emailVerified) {
      await emailverifyMutation.mutateAsync({ uid: auth.currentUser.uid });
      setMsg(defaultMsg);
    }
  };

  const sendEmailVerification = async () => {
    verifyEmail().then(() => {
      setMsg({
        description: "Verification email has been sent!",
        buttonText: "Check Status",
        onClick: checkVerified,
      });
    });
  };
  const defaultMsg = {
    description: "Your Email has not been verified.",
    buttonText: "Verify",
    onClick: sendEmailVerification,
  };

  const [msg, setMsg] = useState(defaultMsg);

  if (userData.email && !userData.emailVerified)
    return (
      <FlowSideBar.ItemGroup>
        <div className="flex w-full flex-col items-start justify-center gap-2 rounded-xl bg-gray-200 p-4 text-sm font-medium text-gray-800 shadow-md dark:bg-gray-700 dark:text-gray-200 ">
          <span>
            <AiOutlineExclamationCircle className="mr-1.5 inline h-4 w-4  " />
            {msg.description}
          </span>
          <button
            onClick={msg.onClick}
            type="button"
            className="mr-2 items-center rounded-lg bg-blue-700 px-3 py-1.5 text-center  text-xs font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 dark:bg-blue-700 dark:hover:bg-blue-600 dark:focus:ring-blue-600/70"
          >
            {msg.buttonText}
          </button>
        </div>
      </FlowSideBar.ItemGroup>
    );

  return <></>;
};

export default EmailVerify;
