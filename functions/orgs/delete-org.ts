import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import Joi from "joi";
import {
  CustomJoi,
  NO_SESSION_RESPONSE,
  JOI_SETTINGS,
  DEFAULTS,
  SESSION_SETTINGS,
  COOKIE_SETTINGS,
  JoiOrgId,
  COOKIE_NAME,
} from "../../Config";
import errorFormatter from "../../utils/errorFormatter";
import getSessionFromCookies from "../../utils/getSessionFromCookies";
import * as Orgs from "../../models/Orgs";
import { sealData } from "iron-session";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log(event);
  const [session, sessionError] = await getSessionFromCookies(event);
  console.log({
    session,
    sessionError,
  });
  if (sessionError) {
    return NO_SESSION_RESPONSE;
  }

  const pathParameters = event.pathParameters || {};
  const input = {
    pathParameters,
  };

  const schema = CustomJoi.object({
    pathParameters: {
      orgId: JoiOrgId,
    },
  }).options(JOI_SETTINGS);

  // Validate input
  try {
    await schema.validateAsync(input);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: `${error.message}` }),
    };
  }

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
    const formattedError = errorFormatter(error);
    return {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "Unable to retrieve org info",
        ...formattedError,
      }),
    };
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
    const formattedError = errorFormatter(failure);
    return {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "We were unable to remove you from the org",
        ...formattedError,
      }),
    };
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
}
