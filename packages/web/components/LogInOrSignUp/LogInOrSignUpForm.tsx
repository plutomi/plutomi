import { useForm, zodResolver } from "@mantine/form";
import {
  Text,
  Button,
  Stack,
  Container,
  Flex,
  Title,
  Card
} from "@mantine/core";
import { useState } from "react";
import { Schema } from "@plutomi/validation";
import { useRouter } from "next/router";
import { useAuthContext } from "@/hooks";
import axios, { type AxiosError } from "axios";
import { notifications } from "@mantine/notifications";
import { handleAxiosError } from "@/utils/handleAxiosResponse";
import { IconCheck, IconInfoCircle, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TOTPCodeForm } from "./TOTPCodeForm";
import { LoginEmailForm } from "./EmailForm";

type LoginOrSignupProps = {
  title?: string;
  subTitle?: string;
};

const redirectToDashboardPaths = ["/login", "/signup"];

export const LogInOrSignUpForm: React.FC<LoginOrSignupProps> = ({
  title,
  subTitle
}) => {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const authContext = useAuthContext();

  const queryClient = useQueryClient();

  const emailForm = useForm<Schema.LogInOrSignUp.email.UIValues>({
    initialValues: { email: "" },
    validate: zodResolver(Schema.LogInOrSignUp.email.UISchema)
  });

  const totpCodeForm = useForm<Schema.LogInOrSignUp.totp.UIValues>({
    initialValues: { totpCode: "" },
    validate: zodResolver(Schema.LogInOrSignUp.totp.UISchema)
  });

  const requestTotp = useMutation({
    mutationFn: async () =>
      axios.post("/api/totp", {
        email: emailForm.values.email
      }),

    onSuccess: () => {
      setStep((currentStep) => currentStep + 1);
    },

    onError: (error: AxiosError) => {
      const message = handleAxiosError(error);
      if (error.response?.status === 302) {
        // User already has a session, redirect them
        notifications.show({
          id: "redirecting",
          withCloseButton: true,
          title: "You already have an active session!",
          message: "Redirecting you...",
          autoClose: 5000,
          icon: <IconInfoCircle />,
          color: "blue"
        });

        if (redirectToDashboardPaths.includes(router.pathname)) {
          // Redirect to dashboard if we're on login or signup
          void router.push("/dashboard");
          return;
        }

        // Otherwise, refetch the user data to remove the login/signup form from the page shell
        void queryClient.invalidateQueries({ queryKey: ["user"] });
        return;
      }

      notifications.show({
        id: "totp-request-error",
        withCloseButton: true,
        title: "An error ocurred",
        message,
        color: "red",
        icon: <IconX />,
        loading: false
      });
    }
  });

  const totpVerify = useMutation({
    mutationFn: async () =>
      axios.post("/api/totp/verify", {
        totpCode: totpCodeForm.values.totpCode,
        email: emailForm.values.email
      }),
    onSuccess: () => {
      notifications.show({
        id: "login-success",
        withCloseButton: true,
        message: "Login successful!",
        autoClose: 2500,
        icon: <IconCheck />,
        color: "green"
      });

      if (redirectToDashboardPaths.includes(router.pathname)) {
        // Redirect to dashboard if we're on login or signup
        void router.push("/dashboard");
        return;
      }
      // Otherwise, refetch the user data to remove the login/signup form from the page shell
      void queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: AxiosError) => {
      const message = handleAxiosError(error);
      notifications.show({
        id: "totp-verify-error",
        withCloseButton: true,
        title: "An error ocurred",
        message,
        color: "red",
        icon: <IconX />,
        loading: false
      });
    }
  });

  const getFormByStep = () => {
    switch (step) {
      case 1:
        return emailForm;
      case 2:
        return totpCodeForm;
      default:
        return emailForm;
    }
  };

  const nextStep = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const currentForm = getFormByStep();

    if (currentForm.validate().hasErrors) {
      return;
    }
    if (step === 1) {
      requestTotp.mutate();
      return;
    }

    if (step === 2) {
      totpVerify.mutate();
    }
  };

  const previousStep = () => {
    // Reset code form if they go back
    totpCodeForm.reset();
    setStep((currentStep) => currentStep - 1);
  };

  const getButtonText = () => {
    if (requestTotp.isLoading && step === 1) {
      return "Sending...";
    }

    if (step === 1) {
      return "Send";
    }

    if (totpVerify.isLoading && step === 2) {
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
  const buttonText = getButtonText();

  const getAuthContext = () => {
    if (subTitle !== undefined) {
      return "continue";
    }

    if (authContext === "login") {
      return "log in";
    }
    return "sign up";
  };

  const getSubheaderText = () => {
    if (step === 1) {
      return `To ${getAuthContext()}, we'll send a one-time code to your email.`;
    }

    if (step === 2) {
      return "Enter the code that you received. It will expire in 5 minutes.";
    }

    return "";
  };

  const subheaderText = getSubheaderText();

  const getTitle = () => {
    if (title === undefined) {
      return `Welcome${authContext === "login" ? " back" : ""}!`;
    }
    return title;
  };

  const nextAndBackButtonsDisabled =
    requestTotp.isLoading || totpVerify.isLoading || totpVerify.isSuccess;

  const titleText = getTitle();
  return (
    <Container size="sm" my={40}>
      <Card>
        <Stack>
          <Title>{titleText}</Title>
          <Text>{subheaderText}</Text>
          <form>
            {step === 1 ? (
              <LoginEmailForm
                form={emailForm}
                isSubmitting={requestTotp.isLoading}
              />
            ) : (
              <TOTPCodeForm
                form={totpCodeForm}
                isSubmitting={totpVerify.isLoading}
              />
            )}
            <Flex justify={step === 1 ? "end" : "space-between"} mt="md">
              {step === 1 ? null : (
                <Button
                  radius="md"
                  variant="default"
                  onClick={previousStep}
                  disabled={nextAndBackButtonsDisabled}
                >
                  Back
                </Button>
              )}

              <Button
                radius="md"
                type="submit"
                onClick={(e) => void nextStep(e)}
                loading={nextAndBackButtonsDisabled}
              >
                {buttonText}
              </Button>
            </Flex>
          </form>
        </Stack>
      </Card>
    </Container>
  );
};
