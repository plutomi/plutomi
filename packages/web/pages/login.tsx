import { upperFirst } from "@mantine/hooks";
import { useForm, zodResolver } from "@mantine/form";
import {
  TextInput,
  Text,
  Paper,
  Group,
  type PaperProps,
  Button,
  Stack,
  Container,
  Stepper,
  Flex
} from "@mantine/core";
import type { NextPage } from "next";
import { useState } from "react";
import { Schema } from "@plutomi/validation";
import { LoginEmailForm } from "@/components/Login/EmailForm";

const Login: NextPage = (props: PaperProps) => {
  const [active, setActive] = useState(1);

  return (
    <Container size="xs">
      <Paper radius="md" p="xl" withBorder {...props}>
        <Stack>
          {" "}
          <Text size="lg" weight={500}>
            Welcome to Plutomi!
          </Text>
          <Text c="dimmed">
            We&apos;ll send a login code to your email to continue.
          </Text>
          <LoginEmailForm />
          <Flex justify="end">
            <Button type="submit" radius="md">
              Continue
            </Button>
          </Flex>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Login;
