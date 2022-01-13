import * as Users from "../../models/Users";
import Joi from "joi";
import {
  JOI_SETTINGS,
  DEFAULTS,
  SESSION_SETTINGS,
  COOKIE_SETTINGS,
  JoiOrgId,
  COOKIE_NAME,
  withDefaultMiddleware,
} from "../../Config";
import middy from "@middy/core";
import * as Orgs from "../../models/Orgs";

import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as Response from "../../utils/createResponse";
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
    return Response.JOI(error);
  }
  const { session } = event.requestContext.authorizer.lambda;

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
    return Response.SDK(
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
    return Response.SDK(failed, "Unable to create org");
  }

  return {
    statusCode: 201,
    body: { message: "Org created!", orgId },
  };
};
// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
