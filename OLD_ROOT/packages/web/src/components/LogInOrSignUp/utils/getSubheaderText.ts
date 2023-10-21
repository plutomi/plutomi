type GetSubheaderTextProps = {
  step: number;
  subheaderAction: string;
};

export const getSubheaderText = ({
  step,
  subheaderAction
}: GetSubheaderTextProps) => {
  if (step === 1) {
    return `To ${subheaderAction}, we'll send a one-time code to your email.`;
  }

  if (step === 2) {
    return "Enter the code that you received. It will expire in 5 minutes.";
  }

  return "";
};
