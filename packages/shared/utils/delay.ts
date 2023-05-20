type DelayProps = {
  // How long to delay for in milliseconds
  ms: number;
};

export const delay = async ({ ms }: DelayProps) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
