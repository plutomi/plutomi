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
import axios, { AxiosError } from "axios";
import { notifications } from "@mantine/notifications";
import { handleAxiosError } from "@/utils/handleAxiosResponse";
import { IconCheck, IconInfoCircle, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/@types";
import { TOTPCodeForm } from "./TOTPCodeForm";
import { LoginEmailForm } from "./EmailForm";
import {
  getButtonText,
  getSubheaderAction,
  getSubheaderText,
  getTitleText
} from "./utils";

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

  const handleRedirect = () => {
    if (redirectToDashboardPaths.includes(router.pathname)) {
      // Redirect to dashboard if we're on login or signup
      void router.push("/dashboard");
      return;
    }

    // Otherwise, refetch the user data to remove the login/signup form from the page shell
    void queryClient.invalidateQueries({
      queryKey: [QueryKeys.GET_CURRENT_USER]
    });
  };

  const requestTotp = useMutation({
    mutationFn: async () =>
      axios.post("/api/totp", {
        email: emailForm.values.email
      }),

    onSuccess: () => {
      setStep((currentStep) => currentStep + 1);
    },

    onError: (error) => {
      const message = handleAxiosError(error);
      if (error instanceof AxiosError && error.response?.status === 302) {
        // User already has a session, redirect them
        notifications.show({
          id: "redirecting",
          withCloseButton: true,
          title: message,
          message: "Redirecting you...",
          autoClose: 5000,
          icon: <IconInfoCircle />,
          color: "blue"
        });

        handleRedirect();
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

      handleRedirect();
    },
    onError: (error) => {
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

  const buttonText = getButtonText({
    step,
    totpIsLoading: totpVerify.isLoading,
    totpVerifyIsLoading: totpVerify.isLoading,
    authContext
  });
  const titleText = getTitleText({ authContext, title });
  const subheaderAction = getSubheaderAction({ subTitle, authContext });
  const subheaderText = getSubheaderText({ step, subheaderAction });

  const nextAndBackButtonsDisabled =
    requestTotp.isLoading || totpVerify.isLoading || totpVerify.isSuccess;

  return (
    <Container size="xs" my={40}>
      <Card withBorder shadow="sm" radius="md">
        <Stack>
          <Title order={3}>{titleText}</Title>
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
