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
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { handleAxiosError } from "@/utils/handleAxiosResponse";
import { IconCheck, IconInfoCircle, IconX } from "@tabler/icons-react";
import { TOTPCodeForm } from "./TOTPCodeForm";
import { LoginEmailForm } from "./EmailForm";

type LoginOrSignupProps = {
  title?: string;
  subTitle?: string;
};

export const LogInOrSignUpForm: React.FC<LoginOrSignupProps> = ({
  title = "Welcome",
  subTitle = "We'll send a one time code to your email"
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const authContext = useAuthContext();

  const emailForm = useForm<Schema.LogInOrSignUp.email.UIValues>({
    initialValues: { email: "" },
    validate: zodResolver(Schema.LogInOrSignUp.email.UISchema)
  });

  const totpCodeForm = useForm<Schema.LogInOrSignUp.totp.UIValues>({
    initialValues: { totpCode: "" },
    validate: zodResolver(Schema.LogInOrSignUp.totp.UISchema)
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

    setIsSubmitting(true);

    if (step === 1) {
      try {
        await axios.post("/api/totp", {
          email: emailForm.values.email
        });

        setStep((currentStep) => currentStep + 1);
      } catch (error: any) {
        const message = handleAxiosError(error);

        if (error.response.status === 302) {
          // User already has a session, redirect them to the dashboard
          notifications.show({
            withCloseButton: true,
            title: message,
            message: "Redirecting you to the dashboard...",
            autoClose: 5000,
            icon: <IconInfoCircle />,
            color: "blue"
          });

          // Dynamic redirect
          void router.push(router.pathname);
          return;
        }

        notifications.show({
          withCloseButton: true,
          title: "An error ocurred",
          message,
          color: "red",
          icon: <IconX />,
          loading: false
        });
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    if (step === 2) {
      try {
        await axios.post("/api/totp/verify", {
          email: emailForm.values.email,
          totpCode: totpCodeForm.values.totpCode
        });

        notifications.show({
          withCloseButton: true,
          // title: "Login successful!",
          // ! TODO: Have this be dynamic depending on where they are going
          message: "Login successful!",
          autoClose: 4000,
          icon: <IconCheck />,
          color: "green"
        });
        // Dynamic redirect
        void router.push(router.pathname);
      } catch (error) {
        const message = handleAxiosError(error);
        notifications.show({
          withCloseButton: true,
          title: "An error ocurred",
          message,
          color: "red",
          icon: <IconX />,
          loading: false
        });

        // Only disable on error incase the page switch takes a while
        setIsSubmitting(false);
      }
    }
  };

  const previousStep = () => {
    // Reset code form if they go back
    totpCodeForm.reset();
    setStep((currentStep) => currentStep - 1);
  };

  const getButtonText = () => {
    if (isSubmitting && step === 1) {
      return "Sending...";
    }

    if (step === 1) {
      return "Send";
    }

    if (isSubmitting && step === 2) {
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

    return "";
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

  const titleText = getTitle();
  return (
    <Container size="sm" my={40}>
      <Card>
        <Stack>
          <Title>{titleText}</Title>
          <Text>{subheaderText}</Text>
          <form>
            {step === 1 ? (
              <LoginEmailForm form={emailForm} isSubmitting={isSubmitting} />
            ) : (
              <TOTPCodeForm form={totpCodeForm} isSubmitting={isSubmitting} />
            )}
            <Flex justify={step === 1 ? "end" : "space-between"} mt="md">
              {step === 1 ? null : (
                <Button
                  radius="md"
                  variant="default"
                  onClick={previousStep}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}

              <Button
                radius="md"
                type="submit"
                onClick={(e) => void nextStep(e)}
                loading={isSubmitting}
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
