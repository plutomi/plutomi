import errorFormatter from "../utils/errorFormatter";
import { SdkError } from "@aws-sdk/types";
/**
 * Formats a Lambda response object whenever an AWS SDK throws an error
 */
export default function createSDKErrorResponse(
  error: SdkError,
  message: string
) {
  const formattedError = errorFormatter(error);
  return {
    statusCode: formattedError.httpStatusCode,
    body: JSON.stringify({
      message,
      ...formattedError,
    }),
  };
}
