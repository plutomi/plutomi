import type { AuthContext } from "@/hooks";

type GetButtonTextProps = {
  requestTotpIsLoading: boolean;
  verifyTotpIsLoading: boolean;
  authContext: AuthContext;
  step: number;
};

export const getButtonText = ({
  requestTotpIsLoading,
  verifyTotpIsLoading,
  step,
  authContext
}: GetButtonTextProps) => {
  if (requestTotpIsLoading && step === 1) {
    return "Sending...";
  }

  if (step === 1) {
    return "Send";
  }

  if (verifyTotpIsLoading && step === 2) {
    if (authContext === "login") {
      return "Logging in...";
    }

    return "Signing up...";
  }

  if (step === 2) {
    if (authContext === "login") {
      return "Log in";
    }

    return "Sign up";
  }

  // This should never be triggered
  return "Continue";
};
