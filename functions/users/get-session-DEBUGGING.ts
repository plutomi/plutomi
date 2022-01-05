import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { withSessionEvent } from "../../types/main";
import Sanitize from "../../utils/sanitize";
import * as Users from "../../models/Users";
import { SessionData } from "../../types/main";
import Joi from "joi";
import {
  COOKIE_SETTINGS,
  CustomJoi,
  DEFAULTS,
  FORBIDDEN_PROPERTIES,
  JOI_SETTINGS,
  NO_SESSION_RESPONSE,
  sessionDataKeys,
  SESSION_SETTINGS,
} from "../../Config";
import errorFormatter from "../../utils/errorFormatter";
import { sealData } from "iron-session";
import getSessionFromCookies from "../../utils/getSessionFromCookies";
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

  return {
    statusCode: 200,
    body: JSON.stringify(session),
  };
}
