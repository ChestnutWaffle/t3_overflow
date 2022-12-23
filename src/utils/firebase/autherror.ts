import { AuthErrorCodes } from "firebase/auth";

const parseAuthErrCode = (code: string) => {
  switch (code) {
    case AuthErrorCodes.INVALID_PASSWORD:
      return "Invalid Password";
    case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
      return "Too many attempts. Try again later.";
    case AuthErrorCodes.NEED_CONFIRMATION:
      return "Account already exists with different provider.";
    case AuthErrorCodes.POPUP_CLOSED_BY_USER:
      return "Popup closed early by user.";
    case AuthErrorCodes.REDIRECT_CANCELLED_BY_USER:
      return "Redirect cancelled by user.";
    case AuthErrorCodes.USER_DELETED:
      return "User not found.";
    case AuthErrorCodes.EMAIL_EXISTS:
      return "Account already exists. Try logging in.";
    default:
      return "Something went wrong.";
  }
};

export { parseAuthErrCode };
