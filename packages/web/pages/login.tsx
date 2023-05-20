import { useForm, zodResolver } from "@mantine/form";
import {
  Text,
  Paper,
  type PaperProps,
  Button,
  Stack,
  Container,
  Flex
} from "@mantine/core";
import type { NextPage } from "next";
import { useState } from "react";
import { Schema } from "@plutomi/validation";
import { LoginEmailForm, LoginCodeForm } from "@/components/Login";
import { delay } from "@plutomi/shared";

const Login: NextPage = (props: PaperProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailForm = useForm<Schema.Login.email.UIValues>({
    initialValues: { email: "" },
    validate: zodResolver(Schema.Login.email.UISchema)
  });

  const loginCodeForm = useForm<Schema.Login.loginCode.UIValues>({
    initialValues: { loginCode: "" },
    validate: zodResolver(Schema.Login.loginCode.UISchema)
  });

  const getFormByStep = () => {
    switch (step) {
      case 1:
        return emailForm;
      case 2:
        return loginCodeForm;
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

    await delay({ ms: 2000 });
    console.log("Submitting");
    // ! TODO: Submit email here

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
      return "Logging in...";
    }

    if (step === 2) {
      return "Login";
    }

    return "";
  };
  const buttonText = getButtonText();

  const getSubheaderText = () => {
    if (step === 1) {
      return "We will send a login code to your email to continue.";
    }

    if (step === 2) {
      return "Enter the code that you received.";
    }

    return "";
  };

  const subheaderText = getSubheaderText();

  return (
    <Container size="xs">
      <Paper radius="md" p="xl" withBorder {...props}>
        <Stack>
          <Text size="lg" weight={700}>
            Welcome to Plutomi!
          </Text>
          <Text c="dimmed">
            {step === 2}
            {subheaderText}
          </Text>
          <form>
            {step === 1 ? (
              <LoginEmailForm form={emailForm} isSubmitting={isSubmitting} />
            ) : (
              <LoginCodeForm form={loginCodeForm} isSubmitting={isSubmitting} />
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
      </Paper>
    </Container>
  );
};

export default Login;
