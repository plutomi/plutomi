export const SDK = (error: any, message: string): { status: number; body: any } => {
  console.error(error, message);
  const status = error?.$metadata?.httpStatusCode || 500;
  const body = {
    message,
    error: error?.name || error || 'ERROR',
    errorMessage: error?.message || 'An error ocurred',
    requestId: error?.$metadata?.requestId || undefined,
    httpStatusCode: status,
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
