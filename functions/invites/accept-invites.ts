import middy from "@middy/core";
import Joi from "joi";
import {
  JOI_SETTINGS,
  DEFAULTS,
  TIME_UNITS,
  withDefaultMiddleware,
} from "../../Config";
import * as Invites from "../../models/Invites";
import * as Time from "../../utils/time";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as Response from "../../utils/customResponse";

const schema = Joi.object({
  pathParameters: {
    inviteId: Joi.string(),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: CustomLambdaEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return Response.JOI(error);
  }

  const { session } = event.requestContext.authorizer.lambda;
  const { inviteId } = event.pathParameters;

  if (session.orgId !== DEFAULTS.NO_ORG) {
    return {
      statusCode: 403,
      body: {
        message: `You already belong to an org: ${session.orgId} - delete it before joining another one!`,
      },
    };
  }

  const [invite, error] = await Invites.getInviteById({
    inviteId,
    userId: session.userId,
  });

  if (error) {
    return Response.SDK(
      error,
      "An error ocurred getting the info for your invite"
    );
  }

  if (!invite) {
    return {
      statusCode: 404,
      body: { message: "Invite no longer exists" },
    };
  }
  // Not sure how this would happen as we do a check before the invite
  // is sent to prevent this...
  if (invite.orgId === session.orgId) {
    return {
      statusCode: 400,
      body: { message: "It appears that you're already in this org!" },
    };
  }

  if (invite.expiresAt <= Time.currentISO()) {
    return {
      statusCode: 403,
      body: {
        message:
          "It looks like that invite has expired, ask the org admin to send you another one!",
      },
    };
  }

  const [joined, joinError] = await Invites.joinOrgFromInvite({
    userId: session.userId,
    invite,
  });

  if (joinError) {
    return Response.SDK(joinError, "We were unable to accept that invite");
  }

  return {
    statusCode: 200,
    body: { message: `You've joined the ${invite.orgName} org!` },
  };
};
// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
