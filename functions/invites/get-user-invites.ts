import * as Users from "../../models/Users";
import Joi from "joi";
import middy from "@middy/core";
import { JOI_SETTINGS, withDefaultMiddleware } from "../../Config";

import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as Response from "../../utils/createResponse";
interface APIGetUserInvitesPathParameters {
  userId?: string;
}
interface APIGetUserInvitesEvent
  extends Omit<CustomLambdaEvent, "pathParameters"> {
  pathParameters: APIGetUserInvitesPathParameters;
}

const schema = Joi.object({
  pathParameters: {
    userId: Joi.string(),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIGetUserInvitesEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return Response.JOI(error);
  }
  const { session } = event.requestContext.authorizer.lambda;
  const { userId } = event.pathParameters;
  if (userId !== session.userId) {
    return {
      statusCode: 403,
      body: {
        message: "You cannot view invites for this user",
      },
    };
  }
  const [invites, error] = await Users.getInvitesForUser({
    userId: session.userId,
  });

  if (error) {
    return Response.SDK(error, "An error ocurred retrieving invites");
  }

  return {
    statusCode: 200,
    body: invites,
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
