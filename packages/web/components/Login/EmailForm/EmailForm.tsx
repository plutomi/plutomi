import { TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import type { Schema } from "@plutomi/validation";

type LoginEmailFormProps = {
  form: UseFormReturnType<Schema.Login.email.UIValues>;
  isSubmitting: boolean;
};

export const LoginEmailForm: React.FC<LoginEmailFormProps> = ({
  form,
  isSubmitting
}) => (
  <TextInput
    required
    label="Email"
    type="email"
    placeholder="jose@plutomi.com"
    radius="md"
    disabled={isSubmitting}
    {...form.getInputProps("email")}
  />
);
