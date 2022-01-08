import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpSecurityHeaders from "@middy/http-security-headers";
import inputOutputLogger from "@middy/input-output-logger";
import middy from "@middy/core";

import Joi from "joi";
import {
  NO_SESSION_RESPONSE,
  JOI_SETTINGS,
  DEFAULTS,
  JoiOrgId,
} from "../../Config";
import errorFormatter from "../../utils/errorFormatter";
import getSessionFromCookies from "../../utils/getSessionFromCookies";
import * as Orgs from "../../models/Orgs";
import createJoiResponse from "../../utils/createJoiResponse";
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

  if (orgId !== session.orgId) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "You cannot view the invites for this org",
      }),
    };
  }

  const [invites, error] = await Orgs.getPendingInvites({ orgId });

  if (error) {
    const formattedError = errorFormatter(error);
    return {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "Unable to retrieve invites for org",
        ...formattedError,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(invites),
  };
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger())
  .use(httpSecurityHeaders());
