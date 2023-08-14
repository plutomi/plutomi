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
import { QueryKeys } from "@/src/@types";
import { TOTPCodeForm } from "./TOTPCodeForm";
import { LoginEmailForm } from "./EmailForm";
import {
  getButtonText,
  getFormByStep,
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

  const verifyTotp = useMutation({
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

  const nextStep = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const currentForm = getFormByStep({
      step,
      emailForm,
      totpCodeForm
    });

    if (currentForm.validate().hasErrors) {
      return;
    }
    if (step === 1) {
      requestTotp.mutate();
      return;
    }

    if (step === 2) {
      verifyTotp.mutate();
    }
  };

  const goBackToEmailForm = () => {
    // Reset code form if they go back
    totpCodeForm.reset();

    // Clear the loading / success state from the previous form
    requestTotp.reset();
    setStep((currentStep) => currentStep - 1);
  };

  const codeIsSending =
    (requestTotp.isLoading ||
      requestTotp.isSuccess ||
      // Redirect due to valid session
      (requestTotp.error as AxiosError)?.response?.status === 302) &&
    step === 1;
  const codeIsVerifying =
    (verifyTotp.isLoading || verifyTotp.isSuccess) && step === 2;

  const buttonText = getButtonText({
    step,
    codeIsSending,
    codeIsVerifying,
    authContext
  });
  const titleText = getTitleText({ authContext, title });
  const subheaderAction = getSubheaderAction({ subTitle, authContext });
  const subheaderText = getSubheaderText({ step, subheaderAction });

  return (
    <Container size="xs" my={40}>
      <Card withBorder shadow="sm" radius="md">
        <Stack>
          <Title order={3}>{titleText}</Title>
          <Text>{subheaderText}</Text>
          <form>
            {step === 1 ? (
              <LoginEmailForm form={emailForm} isSubmitting={codeIsSending} />
            ) : (
              <TOTPCodeForm
                form={totpCodeForm}
                isSubmitting={codeIsVerifying}
              />
            )}
            <Flex justify={step === 1 ? "end" : "space-between"} mt="md">
              {step === 1 ? null : (
                <Button
                  radius="md"
                  variant="default"
                  onClick={goBackToEmailForm}
                  disabled={codeIsSending || codeIsVerifying}
                >
                  Back
                </Button>
              )}

              <Button
                radius="md"
                type="submit"
                onClick={(e) => void nextStep(e)}
                loading={codeIsSending || codeIsVerifying}
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
