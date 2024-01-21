import { type AxiosError, isAxiosError } from "axios";

type ErrorResponse = {
  message: string;
};

export const handleAxiosError = <T extends ErrorResponse>(
  err: unknown
): string => {
  if (isAxiosError(err)) {
    const axiosError = err as AxiosError<T>;
    const { message } = axiosError.response?.data ?? {};
    if (typeof message === "string") {
      return message;
    }
    return "No additional information was provided by the server.";
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "An unknown error occurred.";
};
