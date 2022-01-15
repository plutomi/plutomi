import Sanitize from "../../utils/sanitize";
import * as Users from "../../models/Users";
import Joi from "joi";
import {
  FORBIDDEN_PROPERTIES,
  JOI_GLOBAL_FORBIDDEN,
  JOI_SETTINGS,
  withDefaultMiddleware,
} from "../../Config";
import middy from "@middy/core";

import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as Response from "../../utils/customResponse";
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
  userRole: Joi.any().forbidden().strip(), // TODO rbac
  orgJoinDate: Joi.any().forbidden().strip(),
  canReceiveEmails: Joi.any().forbidden().strip(),
  GSI1PK: Joi.any().forbidden().strip(),
  GSI2PK: Joi.any().forbidden().strip(), // Email
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
    return Response.JOI(error);
  }

  const { session } = event.requestContext.authorizer.lambda;
  const { userId } = event.pathParameters;
  const { newValues } = event.body;

  // TODO RBAC will go here, right now you can only update yourself
  if (userId !== session.userId) {
    // TODO this can be moved into JOI
    return {
      statusCode: 403,
      body: { message: "You cannot update another user" },
    };
  }

  const updateUserInput = {
    userId: session.userId,
    newValues,
  };

  const [updatedUser, error] = await Users.updateUser(updateUserInput);

  if (error) {
    return Response.SDK(error, "An error ocurred updating user info");
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
module.exports.main = middy(main).use(withDefaultMiddleware);
