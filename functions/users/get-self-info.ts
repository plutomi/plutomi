import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import * as Users from "../../models/Users";
import { NO_SESSION_RESPONSE } from "../../Config";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";

import inputOutputLogger from "@middy/input-output-logger";
import middy from "@middy/core";

import getSessionFromCookies from "../../utils/getSessionFromCookies";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const [session, sessionError] = await getSessionFromCookies(event);
  console.log({
    session,
    sessionError,
  });
  if (sessionError) {
    return NO_SESSION_RESPONSE;
  }
  const [user, error] = await Users.getUserById({ userId: session.userId });

  if (error) {
    return createSDKErrorResponse(
      error,
      "An error ocurred retrieving your info"
    );
  }

  // User was deleted for some reason
  if (!user) {
    return NO_SESSION_RESPONSE;
  }
  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger());
