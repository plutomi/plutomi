import Joi from "joi";
import {
  NO_SESSION_RESPONSE,
  JOI_SETTINGS,
  JoiOrgId,
  MIDDY_SERIALIZERS,
} from "../../Config";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpResponseSerializer from "@middy/http-response-serializer";
import inputOutputLogger from "@middy/input-output-logger";
import middy from "@middy/core";
import getSessionFromCookies from "../../utils/getSessionFromCookies";
import * as Orgs from "../../models/Orgs";
import createJoiResponse from "../../utils/createJoiResponse";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
import { CustomLambdaEvent } from "../../types/main";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

const schema = Joi.object({
  pathParameters: {
    orgId: JoiOrgId,
  },
}).options(JOI_SETTINGS);

interface APIGetOrgInfoPathParameters {
  orgId?: string;
}
interface APIGetOrgInfoOrgEvent
  extends Omit<CustomLambdaEvent, "pathParameters"> {
  pathParameters: APIGetOrgInfoPathParameters;
}
const main = async (event: APIGetOrgInfoOrgEvent) => {
  const [session, sessionError] = await getSessionFromCookies(event);
  console.log({
    session,
    sessionError,
  });
  if (sessionError) {
    return NO_SESSION_RESPONSE;
  }

  try {
    await schema.validateAsync(event);
  } catch (error) {
    return createJoiResponse(error);
  }

  const orgId = tagGenerator.generate(event.pathParameters.orgId);

  if (orgId !== session.orgId) {
    return {
      statusCode: 403,
      body: {
        message: "You cannot view this org",
      },
    };
  }

  const [org, error] = await Orgs.getOrgById({ orgId });

  if (error) {
    return createSDKErrorResponse(error, "Unable to retrieve org info");
  }

  if (!org) {
    return {
      statusCode: 404,
      body: { message: "Org not found" },
    };
  }

  return {
    statusCode: 200,
    body: org,
  };
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger())
  .use(httpResponseSerializer(MIDDY_SERIALIZERS));
