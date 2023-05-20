import { TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import type { Schema } from "@plutomi/validation";

type LoginEmailFormProps = {
  form: UseFormReturnType<Schema.Login.email.UIValues>;
};

export const LoginEmailForm: React.FC<LoginEmailFormProps> = ({ form }) => (
  <TextInput
    required
    label="Email"
    type="email"
    placeholder="jose@plutomi.com"
    radius="md"
    // value={form.values.email}
    // onChange={(event) => {
    //   form.setFieldValue("email", event.currentTarget.value);
    // }}
    // error={form.errors.email}
    {...form.getInputProps("email")}
  />
);
