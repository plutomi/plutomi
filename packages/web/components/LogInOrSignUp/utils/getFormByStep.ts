import type { UseFormReturnType } from "@mantine/form";
import type { Schema } from "@plutomi/validation";

type GetFormByStepProps = {
  step: number;
  emailForm: UseFormReturnType<Schema.LogInOrSignUp.email.UIValues>;
  totpCodeForm: UseFormReturnType<Schema.LogInOrSignUp.totp.UIValues>;
};

export const getFormByStep = ({
  step,
  emailForm,
  totpCodeForm
}: GetFormByStepProps) => {
  switch (step) {
    case 1:
      return emailForm;
    case 2:
      return totpCodeForm;
    default:
      return emailForm;
  }
};
