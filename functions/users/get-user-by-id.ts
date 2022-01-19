import * as Users from "../../models/Users";
import Joi from "joi";
import { DEFAULTS, JOI_SETTINGS, withDefaultMiddleware } from "../../Config";
import middy from "@middy/core";

import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as CreateError from "../../utils/errorGenerator";
interface APIUserByIdPathParameters {
  userId?: string;
}
interface APIUserByIdEvent extends Omit<CustomLambdaEvent, "pathParameters"> {
  pathParameters: APIUserByIdPathParameters;
}

const schema = Joi.object({
  pathParameters: {
    userId: Joi.string(),
  },
}).options(JOI_SETTINGS);

const main = async (event: APIUserByIdEvent): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return CreateError.JOI(error);
  }

  const { session } = event.requestContext.authorizer.lambda;
  const { userId } = event.pathParameters;
  if (
    // Block users who are not in an org from being able to view other users before making the Dynamo call
    session.orgId === DEFAULTS.NO_ORG &&
    session.userId !== userId
  ) {
    return {
      statusCode: 403,
      body: {
        message: "You are not authorized to view this user",
      },
    };
  }

  const [requestedUser, error] = await Users.getUserById({
    userId,
  });

  if (error) {
    return CreateError.SDK(
      error,
      "An error ocurred retrieving user info by id"
    );
  }
  if (!requestedUser) {
    return {
      statusCode: 404,
      body: { message: "User not found" },
    };
  }

  // TODO RBAC here
  // Only allow viewing users in the same org
  if (session.orgId !== requestedUser.orgId) {
    return {
      statusCode: 403,
      body: {
        message: "You are not authorized to view this user - not in same org",
      },
    };
  }

  return {
    statusCode: 200,
    body: requestedUser,
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
