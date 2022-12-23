import { signInGooglePopup } from "@utils/firebase";
import { IoLogoGoogle } from "react-icons/io5";
import { UserCtx } from "@context/UserContext";
import { useContext } from "react";
import { trpc } from "@utils/trpc";

const GoogleBtn = () => {
  const { updateCtx } = useContext(UserCtx);

  const googleMutation = trpc.auth.google.useMutation({
    onSuccess: (data) => {
      updateCtx(data);
    },
  });

  const googleLogin = async () => {
    const response = await signInGooglePopup();
    await googleMutation.mutateAsync({ user: JSON.stringify(response.user) });
  };

  return (
    <button
      onClick={googleLogin}
      type="button"
      className="mr-2 mb-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
    >
      <IoLogoGoogle className="h-5 w-5" />
      <span className="google-button hidden">Sign in with Google</span>
    </button>
  );
};

export default GoogleBtn;
