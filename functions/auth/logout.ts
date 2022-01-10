import {
  COOKIE_NAME,
  COOKIE_SETTINGS,
  withSessionMiddleware,
} from "../../Config";
import middy from "@middy/core";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { CustomLambdaResponse } from "../../types/main";
// TODO create logoout event in Dynamo

// ALSO TODO?
// Since this requires a session to log out,
// A user without a session will receive the message:
// "Please log in again" if they try to log out but are already logged out.
// Maybe add a check in the withSessionMiddleware to check for that
const main = async (
  event: APIGatewayProxyEventV2
): Promise<CustomLambdaResponse> => {
  return {
    statusCode: 200,
    cookies: [`${COOKIE_NAME}=''; Max-Age=-1; ${COOKIE_SETTINGS}`],
    body: { message: "You've succesfully logged out!" },
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withSessionMiddleware);
