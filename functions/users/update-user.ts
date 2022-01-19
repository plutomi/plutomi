import * as Users from "../../models/Users";
import Joi from "joi";
import { DEFAULTS, JOI_GLOBAL_FORBIDDEN, JOI_SETTINGS } from "../../Config";
import middy from "@middy/core";

import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as CreateError from "../../utils/errorGenerator";
interface APIUpdateUserPathParameters {
  userId?: string;
}
interface APIUpdateUserBody {
  newValues?: { [key: string]: any };
}
interface APIUpdateUserEvent
  extends Omit<CustomLambdaEvent, "body" | "pathParameters"> {
  body: APIUpdateUserBody;
  pathParameters: APIUpdateUserPathParameters;
}

/**
 * When calling PUT /users/:userId, these properties cannot be updated by the user
 */
const JOI_FORBIDDEN_USER = Joi.object({
  ...JOI_GLOBAL_FORBIDDEN,
  userId: Joi.any().forbidden().strip(),
  userRole: Joi.any().forbidden().strip(), // TODO rbac
  orgJoinDate: Joi.any().forbidden().strip(),
  canReceiveEmails: Joi.any().forbidden().strip(),
  GSI1PK: Joi.any().forbidden().strip(), // Org users
  firstName: Joi.string().invalid(DEFAULTS.FIRST_NAME),
  lastName: Joi.string().invalid(DEFAULTS.LAST_NAME),
  unsubscribeKey: Joi.any().forbidden().strip(),
  GSI2PK: Joi.any().forbidden().strip(), // Email
  GSI2SK: Joi.any().forbidden().strip(), // Entity type
  totalInvites: Joi.any().forbidden().strip(),
  verifiedEmail: Joi.any().forbidden().strip(), // Updated asynchronously (step functions) on 1st login
});

const schema = Joi.object({
  pathParameters: {
    userId: Joi.string(),
  },
  body: {
    newValues: JOI_FORBIDDEN_USER,
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIUpdateUserEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return CreateError.JOI(error);
  }

  const { session } = event.requestContext.authorizer.lambda;
  const { userId } = event.pathParameters;
  const { newValues } = event.body;

  // TODO RBAC will go here, right now you can only update yourself
  if (userId !== session.userId) {
    return {
      statusCode: 403,
      body: { message: "You cannot update another user" },
    };
  }

  const [updatedUser, error] = await Users.updateUser({
    userId: session.userId,
    newValues,
  });

  if (error) {
    return CreateError.SDK(error, "An error ocurred updating user info");
  }

  return {
    statusCode: 200,
    body: {
      // TODO RBAC is not implemented yet so this won't trigger
      message:
        userId === session.userId ? "Updated your info!" : "User updated!",
    },
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
