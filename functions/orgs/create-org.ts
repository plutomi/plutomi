import * as Users from "../../models/Users";
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
  body: {
    orgId: JoiOrgId,
    displayName: Joi.string().invalid(
      DEFAULTS.NO_ORG,
      tagGenerator.generate(DEFAULTS.NO_ORG)
    ),
  },
}).options(JOI_SETTINGS);

interface APICreateOrgBody {
  orgId?: string;
  displayName?: string;
}
interface APICreateOrgEvent extends Omit<CustomLambdaEvent, "body"> {
  body: APICreateOrgBody;
}
const main = async (event: APICreateOrgEvent) => {
  const [session, sessionError] = await getSessionFromCookies(event);

  if (sessionError) {
    return NO_SESSION_RESPONSE;
  }

  try {
    await schema.validateAsync(event);
  } catch (error) {
    return createJoiResponse(error);
  }

  if (session.orgId !== DEFAULTS.NO_ORG) {
    return {
      statusCode: 403,
      body: { message: `You already belong to an org!` },
    };
  }

  const [pendingInvites, error] = await Users.getInvitesForUser({
    userId: session.userId,
  });

  if (error) {
    return createSDKErrorResponse(
      error,
      "Unable to create org - error retrieving invites"
    );
  }

  if (pendingInvites && pendingInvites.length > 0) {
    return {
      statusCode: 403,
      body: {
        message:
          "You seem to have pending invites, please accept or reject them before creating an org :)",
      },
    };
  }
  const { displayName } = event.body;
  const orgId = tagGenerator.generate(event.body.orgId);

  const [created, failed] = await Orgs.createAndJoinOrg({
    userId: session.userId,
    orgId,
    displayName,
  });

  if (failed) {
    return createSDKErrorResponse(failed, "Unable to create org");
  }

  // Update the logged in user session with the new org id
  const newSession = { ...session, orgId }; // TODO this orgid is not being set
  const encryptedCookie = await sealData(newSession, SESSION_SETTINGS);
  return {
    statusCode: 201,
    cookies: [`${COOKIE_NAME}=${encryptedCookie}; ${COOKIE_SETTINGS}`],
    body: { message: "Org created!", orgId },
  };
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger())
  .use(httpResponseSerializer(MIDDY_SERIALIZERS));
