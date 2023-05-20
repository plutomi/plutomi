import { TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { TOTP_CODE_LENGTH, generateLoginCode } from "@plutomi/shared";
import type { Schema } from "@plutomi/validation";

type TOTPCodeFormProps = {
  form: UseFormReturnType<Schema.LogInOrSignUp.totpCode.UIValues>;
  isSubmitting: boolean;
};

const placeholderCode = generateLoginCode();
// TODO Change this to a https://mantine.dev/core/pin-input/

// ! TODO: Use this:
// ! TODO: use this:
// https://mantine.dev/core/loading-overlay/

export const TOTPCodeForm: React.FC<TOTPCodeFormProps> = ({
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
    maxLength={TOTP_CODE_LENGTH}
    placeholder={`Example: ${placeholderCode}`}
    onChange={(event) => {
      form.setFieldValue("loginCode", event.currentTarget.value.toUpperCase());
    }}
  />
);
