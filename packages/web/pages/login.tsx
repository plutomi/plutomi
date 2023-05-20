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

const Login: NextPage = (props: PaperProps) => {
  const [step, setStep] = useState(1);

  const emailForm = useForm<Schema.Login.email.UIValues>({
    initialValues: { email: "" },
    validate: zodResolver(Schema.Login.email.UISchema)
  });

  const loginCodeForm = useForm<Schema.Login.loginCode.UIValues>({
    initialValues: { loginCode: "" },
    validate: zodResolver(Schema.Login.loginCode.UISchema)
  });

  const nextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const previousStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  return (
    <Container size="xs">
      <Paper radius="md" p="xl" withBorder {...props}>
        <Stack>
          <Text size="lg" weight={700}>
            Welcome to Plutomi!
          </Text>
          <Text c="dimmed">
            We&apos;ll send a login code to your email to continue.
          </Text>
          {step === 1 ? (
            <LoginEmailForm form={emailForm} />
          ) : (
            <LoginCodeForm form={loginCodeForm} />
          )}
          <Flex justify={step === 1 ? "end" : "space-between"}>
            {step === 1 ? null : (
              <Button radius="md" variant="default" onClick={previousStep}>
                Back
              </Button>
            )}

            <Button type="submit" radius="md" onClick={nextStep}>
              {step === 1 ? "Next" : "Login"}
            </Button>
          </Flex>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Login;
