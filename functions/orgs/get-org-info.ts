import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
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

  const schema = Joi.object({
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

  if (orgId !== session.orgId) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "You cannot view this org",
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

  return {
    statusCode: 200,
    body: JSON.stringify(org),
  };
}
