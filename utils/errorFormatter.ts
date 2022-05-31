import { SdkError } from '@aws-sdk/types';
/**
 * Given an error from the AWS SDK, this function returns a neat error object to use in API responses
 * @param error
 */
export default function handler(error: SdkError) {
  /* eslint no-console: "off" */
  console.error(error);
  return {
    error: error?.name || error || 'ERROR',
    errorMessage: error?.message || 'An error ocurred',
    requestId?: error?.$metadata?.requestId || undefined,
    httpStatusCode: error?.$metadata?.httpStatusCode || 500,
  };
}
