import { CustomLambdaResponse } from "../types/main";

export default function createJoiResponse(error: Error): CustomLambdaResponse {
  return {
    statusCode: 400,
    body: { message: `${error.message}` },
  };
}
