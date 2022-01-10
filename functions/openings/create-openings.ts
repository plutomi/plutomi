import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import * as Openings from "../../models/Openings";
import inputOutputLogger from "@middy/input-output-logger";
import middy from "@middy/core";

import Joi from "joi";
import {
  NO_SESSION_RESPONSE,
  JOI_SETTINGS,
  DEFAULTS,
  TIME_UNITS,
} from "../../Config";
import * as Invites from "../../models/Invites";
import * as Time from "../../utils/time";
import * as Users from "../../models/Users";
import * as Orgs from "../../models/Orgs";
import getSessionFromCookies from "../../utils/getSessionFromCookies";
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
    body: {
      GSI1SK: Joi.string().max(100),
    },
  }).options(JOI_SETTINGS);

  // Validate input
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return createJoiResponse(error);
  }

  // TODO types
  // @ts-ignore
  const { GSI1SK } = body;

  if (session.orgId === DEFAULTS.NO_ORG) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `You must create an organization before creating openings`,
      }),
    };
  }

  const [created, createOpeningError] = await Openings.createOpening({
    orgId: session.orgId,
    GSI1SK,
  });

  if (createOpeningError) {
    return createSDKErrorResponse(
      createOpeningError,
      "An error ocurred creating opening"
    );
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ message: "Opening created!" }),
  };
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger());
