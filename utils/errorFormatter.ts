import { SdkError } from "@aws-sdk/types";
/**
 * Given an error from the AWS SDK, this function returns a neat error object to use in API responses
 * @param error
 */
export default function handler(error: SdkError) {
  console.error(error);
  return {
    error: error.name,
    errorMessage: error.message,
    requestId: error.$metadata.requestId,
    httpStatusCode: error.$metadata.httpStatusCode,
  };
}
