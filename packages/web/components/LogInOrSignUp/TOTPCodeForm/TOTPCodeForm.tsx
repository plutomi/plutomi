import { TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { TOTP_LENGTH, generateTOTP } from "@plutomi/shared";
import type { Schema } from "@plutomi/validation";

type TOTPCodeFormProps = {
  form: UseFormReturnType<Schema.LogInOrSignUp.totp.UIValues>;
  isSubmitting: boolean;
};

const placeholderText = `Example: ${generateTOTP()}`;

// TODO: Change this to a https://mantine.dev/core/pin-input/
// TODO: Use this?:
// https://mantine.dev/core/loading-overlay/

export const TOTPCodeForm: React.FC<TOTPCodeFormProps> = ({
  form,
  isSubmitting
}) => {
  const { onChange, ...otherProps } = form.getInputProps("totpCode");
  // TODO: Add focus trap

  return (
    <TextInput
      {...otherProps}
      required
      label="Code"
      type="text"
      radius="md"
      disabled={isSubmitting}
      maxLength={TOTP_LENGTH}
      placeholder={placeholderText}
      onChange={(event) => {
        form.setFieldValue("totpCode", event.currentTarget.value.toUpperCase());
      }}
    />
  );
};
