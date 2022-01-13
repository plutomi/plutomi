import { withDefaultMiddleware } from "../../Config";
import middy from "@middy/core";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
const main = async (
  event: CustomLambdaEvent // TODO create type
): Promise<CustomLambdaResponse> => {
  const { session } = event.requestContext.authorizer.lambda;

  return {
    statusCode: 200,
    body: session,
  };
};
// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
