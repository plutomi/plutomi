import Joi from "joi";
import * as Invites from "../../models/Invites";
import { JOI_SETTINGS, withDefaultMiddleware } from "../../Config";
import middy from "@middy/core";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as Response from "../../utils/createResponse";
interface APIRejectInvitesPathParameters {
  inviteId?: string;
}
interface APIRejectInvitesEvent
  extends Omit<CustomLambdaEvent, "pathParameters"> {
  pathParameters: APIRejectInvitesPathParameters;
}

const schema = Joi.object({
  pathParameters: {
    inviteId: Joi.string(),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIRejectInvitesEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return Response.JOI(error);
  }
  const { session } = event.requestContext.authorizer.lambda;
  const { inviteId } = event.pathParameters;

  const [deleted, error] = await Invites.deleteInvite({
    inviteId,
    userId: session.userId,
  });

  if (error) {
    return createSDKErrorResponse(
      error,
      "We were unable to reject that invite"
    );
  }

  return {
    statusCode: 200,
    body: { message: "Invite rejected!" },
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
