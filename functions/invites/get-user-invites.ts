import * as Users from "../../models/Users";
import Joi from "joi";
import middy from "@middy/core";
import { JOI_SETTINGS, withDefaultMiddleware } from "../../Config";

import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as CreateError from "../../utils/errorGenerator";

const main = async (
  event: CustomLambdaEvent
): Promise<CustomLambdaResponse> => {
  const { session } = event.requestContext.authorizer.lambda;

  const [invites, error] = await Users.getInvitesForUser({
    userId: session.userId,
  });

  if (error) {
    return CreateError.SDK(error, "An error ocurred retrieving invites");
  }

  return {
    statusCode: 200,
    body: invites,
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
