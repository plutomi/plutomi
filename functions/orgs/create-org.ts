import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import * as Users from "../../models/Users";
import Joi from "joi";
import {
  CustomJoi,
  NO_SESSION_RESPONSE,
  JOI_SETTINGS,
  DEFAULTS,
  sessionDataKeys,
  SESSION_SETTINGS,
  COOKIE_SETTINGS,
  JoiOrgId,
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

  const body = JSON.parse(event.body || "{}");
  const input = {
    body,
  };

  const schema = CustomJoi.object({
    body: {
      orgId: JoiOrgId,
      displayName: Joi.string().invalid(
        DEFAULTS.NO_ORG,
        tagGenerator.generate(DEFAULTS.NO_ORG)
      ),
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

  if (session.orgId !== DEFAULTS.NO_ORG) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: `You already belong to an org!` }),
    };
  }

  const [pendingInvites, error] = await Users.getInvitesForUser({
    userId: session.userId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "Unable to create org - error retrieving invites",
        ...formattedError,
      }),
    };
  }

  if (pendingInvites && pendingInvites.length > 0) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message:
          "You seem to have pending invites, please accept or reject them before creating an org :)",
      }),
    };
  }
  const { displayName } = body;
  const orgId = tagGenerator.generate(body.orgId);

  const [created, failed] = await Orgs.createAndJoinOrg({
    userId: session.userId,
    orgId,
    displayName,
  });

  if (failed) {
    const formattedError = errorFormatter(failed);
    return {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "Unable to create org",
        ...formattedError,
      }),
    };
  }

  // Update the logged in user session with the new org id
  const newSession = { ...session, orgId };
  const encryptedCookie = await sealData(newSession, SESSION_SETTINGS);
  return {
    statusCode: 201,
    cookies: [`${DEFAULTS.COOKIE_NAME}=${encryptedCookie}; ${COOKIE_SETTINGS}`],
    body: JSON.stringify({ message: "Org created!", org: orgId }),
  };
}
