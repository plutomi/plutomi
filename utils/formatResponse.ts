/**
 *
 * @param statusCode Status code to return to the user
 * @param object What you actually want to return to the user
 * @param headers Optional headers
 * @returns A JSON.stringified version of your object in the lambda format
 */
export default function FormattedResponse(
  statusCode: number,
  object: {},
  headers?: {}
) {
  return {
    body: JSON.stringify(object),
    statusCode: statusCode,
    headers: headers,
  };
}
