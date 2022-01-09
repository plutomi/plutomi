import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import * as Orgs from "../../models/Orgs";
import { DEFAULTS, NO_SESSION_RESPONSE } from "../../Config";
import getSessionFromCookies from "../../utils/getSessionFromCookies";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";

import inputOutputLogger from "@middy/input-output-logger";
import middy from "@middy/core";
import Sanitize from "../../utils/sanitize";
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

  if (session.orgId === DEFAULTS.NO_ORG) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "You must create an org or join one to view it's users",
      }),
    };
  }

  const [users, error] = await Orgs.getUsersInOrg({
    orgId: session.orgId,
  });

  if (error) {
    return createSDKErrorResponse(
      error,
      "An error ocurred getting the users in your org"
    );
  }

  const cleanUsers = users.map(
    (user) =>
      Sanitize(
        "KEEP",
        ["userId", "orgId", "firstName", "lastName", "email", "orgJoinDate"],
        user
      ).object
  );
  return {
    statusCode: 200,
    body: JSON.stringify(cleanUsers),
  };
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger());
