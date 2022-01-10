import Joi from "joi";
import {
  NO_SESSION_RESPONSE,
  JOI_SETTINGS,
  DEFAULTS,
  SESSION_SETTINGS,
  COOKIE_SETTINGS,
  JoiOrgId,
  COOKIE_NAME,
  MIDDY_SERIALIZERS,
} from "../../Config";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpResponseSerializer from "@middy/http-response-serializer";
import inputOutputLogger from "@middy/input-output-logger";
import middy from "@middy/core";
import getSessionFromCookies from "../../utils/getSessionFromCookies";
import * as Orgs from "../../models/Orgs";
import { sealData } from "iron-session";
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

interface APIDeleteOrgPathParameters {
  orgId?: string;
}
interface APIDeleteOrgEvent extends Omit<CustomLambdaEvent, "pathParameters"> {
  pathParameters: APIDeleteOrgPathParameters;
}
const main = async (event: APIDeleteOrgEvent) => {
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

  if (session.orgId !== orgId) {
    return {
      statusCode: 403,
      body: {
        message: "You cannot delete this org as you do not belong to it",
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
  if (org.totalUsers > 1) {
    return {
      statusCode: 403,
      body: {
        message: "You cannot delete this org as there are other users in it",
      },
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
    body: { message: "Org deleted!" },
  };
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger())
  .use(httpResponseSerializer(MIDDY_SERIALIZERS));
