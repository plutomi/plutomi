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

const Login: NextPage = (props: PaperProps) => {
  const [active, setActive] = useState(1);

  const form = useForm({
    initialValues: {
      email: "",
      loginCode: ""
    },

    validate: zodResolver(Schema.Login.)
  });

  return (
    <Container>
      <Paper radius="md" p="xl" withBorder {...props}>
        <Flex>
          <Stack>
            <Stepper
              active={active}
              onStepClick={setActive}
              orientation="vertical"
            >
              <Stepper.Step label="Step 1" description="Enter your email" />
              <Stepper.Step label="Step 2" description="Verify login code" />
            </Stepper>
          </Stack>
          <Stack></Stack>
        </Flex>
        <Text size="lg" weight={500}>
          Welcome to Plutomi!
        </Text>
        <Text c="dimmed">
          We&apos;ll send a login code to your email to continue.
        </Text>

        <form onSubmit={form.onSubmit(() => {})}>
          <Stack>
            <TextInput
              required
              label="Email"
              placeholder="jose@plutomi.com"
              value={form.values.email}
              onChange={(event) => {
                form.setFieldValue("email", event.currentTarget.value);
              }}
              error={form.errors.email !== undefined && "Invalid email"}
              radius="md"
            />
          </Stack>

          <Group position="apart" mt="xl">
            <Button type="submit" radius="xl">
              {upperFirst("Continue")}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
