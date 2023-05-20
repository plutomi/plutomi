import { TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { LOGIN_CODE_LENGTH, generateLoginCode } from "@plutomi/shared";
import type { Schema } from "@plutomi/validation";

type LoginCodeFormProps = {
  form: UseFormReturnType<Schema.Login.loginCode.UIValues>;
  isSubmitting: boolean;
};

const placeholderCode = generateLoginCode();

export const LoginCodeForm: React.FC<LoginCodeFormProps> = ({
  form,
  isSubmitting
}) => (
  <TextInput
    {...form.getInputProps("loginCode")}
    required
    label="Login Code"
    type="text"
    radius="md"
    disabled={isSubmitting}
    maxLength={LOGIN_CODE_LENGTH}
    placeholder={`Example: ${placeholderCode}`}
    onChange={(event) => {
      form.setFieldValue("loginCode", event.currentTarget.value.toUpperCase());
    }}
  />
);
