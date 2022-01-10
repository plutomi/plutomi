import { withSessionMiddleware } from "../../Config";
import middy from "@middy/core";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
const main = async (
  event: CustomLambdaEvent // TODO create type
): Promise<CustomLambdaResponse> => {
  return {
    statusCode: 200,
    body: event.session,
  };
};
// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withSessionMiddleware);
