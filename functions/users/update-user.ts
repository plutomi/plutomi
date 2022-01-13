import Sanitize from "../../utils/sanitize";
import * as Users from "../../models/Users";
import Joi from "joi";
import {
  FORBIDDEN_PROPERTIES,
  JOI_SETTINGS,
  withDefaultMiddleware,
} from "../../Config";
import middy from "@middy/core";

import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as Response from "../../utils/createResponse";
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

const schema = Joi.object({
  pathParameters: {
    userId: Joi.string(),
  },
  body: {
    newValues: Joi.object(),
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

  const filteredValues = Sanitize(
    "REMOVE",
    FORBIDDEN_PROPERTIES.USER,
    newValues
  );
  // TODO add this to all other update expressions, or combine them into one
  // Throw an error if all properties are invalid (empty object)
  if (Object.keys(filteredValues.object).length === 0) {
    return {
      statusCode: 400,
      body: { message: "All properties are invalid" },
    };
  }
  const updateUserInput = {
    userId: session.userId,
    ALLOW_FORBIDDEN_KEYS: false,
    newValues: filteredValues.object,
  };

  const [updatedUser, error] = await Users.updateUser(updateUserInput);

  if (error) {
    return Response.SDK(error, "An error ocurred updating user info");
  }

  // If a signed in user is updating themselves, update the session state as well
  if (updatedUser.userId === session.userId) {
    const customMessage = filteredValues.removedKeys.length
      ? `We've updated your info, but some properties could not be updated: '${filteredValues.removedKeys.join(
          ", "
        )}'`
      : `We've updated your info!`;
    return {
      statusCode: 200,
      body: {
        message: customMessage,
      },
    };
  }
  // When updating another user
  const customMessage = filteredValues.removedKeys.length
    ? `User updated! However, some properties could not be updated: '${filteredValues.removedKeys.join(
        ", "
      )}'`
    : `User updated!`;

  return {
    statusCode: 200,
    body: {
      message: customMessage,
    },
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
