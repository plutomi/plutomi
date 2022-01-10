import * as Orgs from "../../models/Orgs";
import { DEFAULTS, MIDDY_SERIALIZERS, NO_SESSION_RESPONSE } from "../../Config";
import getSessionFromCookies from "../../utils/getSessionFromCookies";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpResponseSerializer from "@middy/http-response-serializer";
import inputOutputLogger from "@middy/input-output-logger";
import middy from "@middy/core";
import Sanitize from "../../utils/sanitize";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
import { CustomLambdaEvent } from "../../types/main";

const main = async (event: CustomLambdaEvent) => {
  const [session, sessionError] = await getSessionFromCookies(event);

  if (sessionError) {
    return NO_SESSION_RESPONSE;
  }

  if (session.orgId === DEFAULTS.NO_ORG) {
    return {
      statusCode: 200,
      body: {
        message: "You must create an org or join one to view it's users",
      },
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
    body: cleanUsers,
  };
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger())
  .use(httpResponseSerializer(MIDDY_SERIALIZERS));
