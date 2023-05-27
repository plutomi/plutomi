import type { AuthContext } from "@/hooks";

type GetButtonTextProps = {
  totpIsLoading: boolean;
  totpVerifyIsLoading: boolean;
  authContext: AuthContext;
  step: number;
};

export const getButtonText = ({
  totpIsLoading,
  totpVerifyIsLoading,
  step,
  authContext
}: GetButtonTextProps) => {
  if (totpIsLoading && step === 1) {
    return "Sending...";
  }

  if (step === 1) {
    return "Send";
  }

  if (totpVerifyIsLoading && step === 2) {
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
