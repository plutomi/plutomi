import type { AuthContext } from "../../../../hooks";

type GetButtonTextProps = {
  codeIsSending: boolean;
  codeIsVerifying: boolean;
  authContext: AuthContext;
  step: number;
};

export const getButtonText = ({
  codeIsSending,
  codeIsVerifying,
  step,
  authContext
}: GetButtonTextProps) => {
  if (step === 1) {
    return codeIsSending ? "Sending..." : "Send";
  }

  if (step === 2) {
    if (codeIsVerifying) {
      return authContext === "login" ? "Logging in..." : "Signing up...";
    }
    return authContext === "login" ? "Log in" : "Sign up";
  }

  // This should never be triggered, but just in case
  return "Continue";
};
