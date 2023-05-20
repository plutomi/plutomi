import { TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import type { Schema } from "@plutomi/validation";

type LoginEmailFormProps = {
  form: UseFormReturnType<Schema.Login.email.UIValues>;
};

export const LoginEmailForm: React.FC<LoginEmailFormProps> = ({ form }) => (
  <TextInput
    {...form.getInputProps("email")}
    required
    label="Email"
    type="email"
    placeholder="jose@plutomi.com"
    value={form.values.email}
    onChange={(event) => {
      form.setFieldValue("email", event.currentTarget.value);
    }}
    error={form.errors.email}
    radius="md"
  />
);
