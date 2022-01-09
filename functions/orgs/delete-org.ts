import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import Joi from "joi";
import {
  NO_SESSION_RESPONSE,
  JOI_SETTINGS,
  DEFAULTS,
  SESSION_SETTINGS,
  COOKIE_SETTINGS,
  JoiOrgId,
  COOKIE_NAME,
} from "../../Config";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";

import inputOutputLogger from "@middy/input-output-logger";
import middy from "@middy/core";
import getSessionFromCookies from "../../utils/getSessionFromCookies";
import * as Orgs from "../../models/Orgs";
import { sealData } from "iron-session";
import createJoiResponse from "../../utils/createJoiResponse";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

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

  const schema = Joi.object({
    pathParameters: {
      orgId: JoiOrgId,
    },
  }).options(JOI_SETTINGS);

  try {
    await schema.validateAsync(event);
  } catch (error) {
    return createJoiResponse(error);
  }

  // TODO types
  // @ts-ignore
  const orgId = tagGenerator.generate(pathParameters.orgId);

  if (session.orgId !== orgId) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "You cannot delete this org as you do not belong to it",
      }),
    };
  }

  const [org, error] = await Orgs.getOrgById({ orgId });

  if (error) {
    return createSDKErrorResponse(error, "Unable to retrieve org info");
  }

  if (!org) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Org not found" }),
    };
  }
  if (org.totalUsers > 1) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "You cannot delete this org as there are other users in it",
      }),
    };
  }

  // Transaction - updates the user with default org values
  const [success, failure] = await Orgs.leaveAndDeleteOrg({
    orgId,
    userId: session.userId,
  });

  if (failure) {
    return createSDKErrorResponse(
      failure,
      "We were unable to remove you from the org"
    );
  }

  const newSession = {
    ...session,
    orgId: DEFAULTS.NO_ORG,
  };

  const encryptedCookie = await sealData(newSession, SESSION_SETTINGS);
  return {
    statusCode: 201,
    cookies: [`${COOKIE_NAME}=${encryptedCookie}; ${COOKIE_SETTINGS}`],
    body: JSON.stringify({ message: "Org deleted!" }),
  };
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger());
