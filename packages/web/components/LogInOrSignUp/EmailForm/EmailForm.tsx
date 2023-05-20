import { TextInput, Text } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import type { Schema } from "@plutomi/validation";

type LoginEmailFormProps = {
  form: UseFormReturnType<Schema.LogInOrSignUp.email.UIValues>;
  isSubmitting: boolean;
};

// ! TODO: use this?:
// https://mantine.dev/core/loading-overlay/
export const LoginEmailForm: React.FC<LoginEmailFormProps> = ({
  form,
  isSubmitting
}) => (
  <>
    <TextInput
      {...form.getInputProps("email")}
      required
      label="Email"
      type="email"
      placeholder="jose@plutomi.com"
      radius="md"
      disabled={isSubmitting}
    />
    <Text c="dimmed">
      You can put any email - this isn&apos;t set up yet :D
    </Text>
  </>
);
