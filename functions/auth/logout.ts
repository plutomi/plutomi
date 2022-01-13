import {
  COOKIE_NAME,
  COOKIE_SETTINGS,
  withDefaultMiddleware,
} from "../../Config";
import middy from "@middy/core";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { CustomLambdaResponse } from "../../types/main";
// TODO create logoout event in Dynamo

const main = async (
  event: APIGatewayProxyEventV2
): Promise<CustomLambdaResponse> => {
  return {
    statusCode: 200,
    cookies: [`${COOKIE_NAME}=''; Max-Age=-1; ${COOKIE_SETTINGS}`],
    body: { message: "You've succesfully logged out!" },
  };
};

//@ts-ignore // TODO types
module.exports.main = middy(main).use(withDefaultMiddleware);
