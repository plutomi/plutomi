import errorFormatter from "./errorFormatter";
import { SdkError } from "@aws-sdk/types";
import { CustomLambdaResponse } from "../types/main";
/**
 * Response for AWS SDK calls.
 * @param error - The error object
 * @param message - Your custom message describing what happened
 * @returns
 */
export function SDK(error: SdkError, message: string) {
  const formattedError = errorFormatter(error);
  const status = formattedError.httpStatusCode;
  const body = {
    message,
    ...formattedError,
  };
  return { status, body };
}

/**
 * Response for Joi errors
 * @param error
 * @returns
 */
export function JOI(error: Error) {
  return {
    status: 400,
    body: { message: `${error.message}` },
  };
}
