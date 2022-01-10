import * as Users from "../../models/Users";
import Joi from "joi";
import {
  JOI_SETTINGS,
  DEFAULTS,
  SESSION_SETTINGS,
  COOKIE_SETTINGS,
  JoiOrgId,
  COOKIE_NAME,
  withSessionMiddleware,
} from "../../Config";
import middy from "@middy/core";
import * as Orgs from "../../models/Orgs";
import { sealData } from "iron-session";
import createJoiResponse from "../../utils/createJoiResponse";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

interface APICreateOrgBody {
  orgId?: string;
  displayName?: string;
}
interface APICreateOrgEvent extends Omit<CustomLambdaEvent, "body"> {
  body: APICreateOrgBody;
}

const schema = Joi.object({
  body: {
    orgId: JoiOrgId,
    displayName: Joi.string(),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APICreateOrgEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return createJoiResponse(error);
  }
  const { session } = event;

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
  const { displayName, orgId } = event.body;

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
// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withSessionMiddleware);
