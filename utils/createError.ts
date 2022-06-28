import errorFormatter from "./errorFormatter";

export const SDK = (error: any, message: string): { status: number; body: any } => {
  console.error(error, message);

  const formattedError = errorFormatter(error);
  const status = error?.$metadata?.httpStatusCode || 500;
  const body = {
    message,
    ...formattedError
  };
  return { status, body };
};

export const JOI = (error: Error): { status: 400; body: { message: string } } => {
  console.error(error);
  return {
    status: 400,
    body: { message: `${error.message}` },
  };
};
