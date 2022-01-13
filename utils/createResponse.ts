import errorFormatter from "../utils/errorFormatter";
import { SdkError } from "@aws-sdk/types";
import { CustomLambdaResponse } from "../types/main";

/**
 * Response for AWS SDK calls.
 * @param error - The error object
 * @param message - Your custom message describing what happened
 * @returns
 */
export function createSDKErrorResponse(error: SdkError, message: string) {
  const formattedError = errorFormatter(error);
  return {
    statusCode: formattedError.httpStatusCode,
    body: {
      message,
      ...formattedError,
    },
  };
}

/**
 * Response for Joi errors
 * @param error
 * @returns
 */
export function JOI(error: Error): CustomLambdaResponse {
  return {
    statusCode: 400,
    body: { message: `${error.message}` },
  };
}
