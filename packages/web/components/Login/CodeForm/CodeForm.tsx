import { TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { generateLoginCode } from "@plutomi/shared";
import type { Schema } from "@plutomi/validation";

type LoginCodeFormProps = {
  form: UseFormReturnType<Schema.Login.loginCode.UIValues>;
};

export const LoginCodeForm: React.FC<LoginCodeFormProps> = ({ form }) => {
  const placeholderCode = generateLoginCode();
  return (
    <TextInput
      required
      label="Login Code"
      type="text"
      placeholder={placeholderCode}
      value={form.values.loginCode}
      onChange={(event) => {
        form.setFieldValue("loginCode", event.currentTarget.value);
      }}
      error={form.errors.loginCode}
      radius="md"
    />
  );
};
