import * as Users from "../../models/Users";
import Joi from "joi";
import { DEFAULTS, JOI_SETTINGS, withSessionMiddleware } from "../../Config";
import middy from "@middy/core";
import createJoiResponse from "../../utils/createJoiResponse";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";

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
    return createJoiResponse(error);
  }

  const { userId } = event.pathParameters;
  const { session } = event;
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
    return createSDKErrorResponse(
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
module.exports.main = middy(main).use(withSessionMiddleware);
