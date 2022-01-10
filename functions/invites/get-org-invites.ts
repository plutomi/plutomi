import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpResponseSerializer from "@middy/http-response-serializer";
import inputOutputLogger from "@middy/input-output-logger";
import middy from "@middy/core";
import Joi from "joi";
import {
  NO_SESSION_RESPONSE,
  JOI_SETTINGS,
  JoiOrgId,
  MIDDY_SERIALIZERS,
} from "../../Config";
import getSessionFromCookies from "../../utils/getSessionFromCookies";
import * as Orgs from "../../models/Orgs";
import createJoiResponse from "../../utils/createJoiResponse";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

const main = async (event) => {
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
      body: {
        message: "You cannot view the invites for this org",
      },
    };
  }

  const [invites, error] = await Orgs.getPendingInvites({ orgId });

  if (error) {
    return createSDKErrorResponse(error, "Unable to retrieve invites for org");
  }

  return {
    statusCode: 200,
    body: invites,
  };
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger())
  .use(httpResponseSerializer(MIDDY_SERIALIZERS));
