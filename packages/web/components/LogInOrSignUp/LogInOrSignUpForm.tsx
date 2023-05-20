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
import { delay } from "@plutomi/shared";
import { useRouter } from "next/router";
import { useAuthContext } from "@/hooks";
import { LoginEmailForm } from "./EmailForm";
import { TOTPCodeForm } from "./TOTPCodeForm";

export const LogInOrSignUpForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const authContext = useAuthContext();

  const emailForm = useForm<Schema.LogInOrSignUp.email.UIValues>({
    initialValues: { email: "" },
    validate: zodResolver(Schema.LogInOrSignUp.email.UISchema)
  });

  const totpCodeForm = useForm<Schema.LogInOrSignUp.totpCode.UIValues>({
    initialValues: { totpCode: "" },
    validate: zodResolver(Schema.LogInOrSignUp.totpCode.UISchema)
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

    // ! TODO: Submit email here
    await delay({ ms: 300 });

    if (step === 2) {
      void router.push("/dashboard");
      return;
    }
    setStep((currentStep) => currentStep + 1);
    setIsSubmitting(false);
  };

  const previousStep = () => {
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

  const getSubheaderText = () => {
    if (step === 1) {
      return `To ${
        authContext === "login" ? "log in" : "sign up"
      }, we'll send a one-time code to your email.`;
    }

    if (step === 2) {
      return "Enter the code that you received. It will expire in 5 minutes.";
    }

    return "";
  };

  const subheaderText = getSubheaderText();

  return (
    <Container size="xs" my={40}>
      <Card>
        <Stack>
          <Title>Welcome{authContext === "login" ? " back" : ""}!</Title>
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
