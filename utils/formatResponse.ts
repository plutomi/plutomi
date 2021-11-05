/**
 *
 * @param statusCode Status code to return to the user
 * @param object What you actually want to return to the user
 * @returns A JSON.stringified version of your object in the lambda format
 */
export default function FormattedResponse(statusCode: number, object: {}) {
  return {
    body: JSON.stringify(object),
    statusCode: statusCode,
  };
}
