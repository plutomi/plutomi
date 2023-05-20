import { useToggle, upperFirst } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Text,
  Paper,
  Group,
  type PaperProps,
  Button,
  Stack,
  Container
} from "@mantine/core";
import type { NextPage } from "next";

const Login: NextPage = (props: PaperProps) => {
  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      password: "",
      terms: true
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length <= 6 ? "Password should include at least 6 characters" : null
    }
  });

  return (
    <Container>
      <Paper radius="md" p="xl" withBorder {...props}>
        <Text size="lg" weight={500}>
          Welcome to Plutomi!
        </Text>
        <Text c="dimmed">
          We&apos;ll send you a login code to your email to continue.
        </Text>

        <form onSubmit={form.onSubmit(() => {})}>
          <Stack>
            <TextInput
              required
              label="Email"
              placeholder="jose@plutomi.dev"
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
