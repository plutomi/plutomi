import { APIGatewayProxyResultV2 } from "aws-lambda";
import { SessionData, withSessionEvent } from "../../types/main";
import * as Users from "../../models/Users";
import Joi from "joi";
import {
  COOKIE_SETTINGS,
  CustomJoi,
  DEFAULTS,
  FORBIDDEN_PROPERTIES,
  JOI_SETTINGS,
  SESSION_SETTINGS,
} from "../../Config";
import errorFormatter from "../../utils/errorFormatter";
import { keepProperties, removeProperties } from "../../utils/sanitize";
import { sealData } from "iron-session";
export async function main(
  event: withSessionEvent
): Promise<APIGatewayProxyResultV2> {
  console.log(event);
  const { session } = event.requestContext.authorizer.lambda;
  const pathParameters = event.pathParameters || {};
  const body = JSON.parse(event.body || "{}");
  const input = {
    pathParameters,
    body,
  };

  const schema = CustomJoi.object({
    pathParameters: {
      userId: Joi.string(),
    },
    body: {
      newValues: Joi.object(),
    },
  }).options(JOI_SETTINGS);

  // Validate input
  try {
    await schema.validateAsync(input);
  } catch (error) {
    const response: APIGatewayProxyResultV2 = {
      statusCode: 400,
      body: JSON.stringify({ message: `${error.message}` }),
    };
    return response;
  }

  const { userId } = pathParameters;
  const { newValues } = body;

  // TODO RBAC will go here, right now you can only update yourself
  if (userId !== session.userId) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "You cannot update another user" }),
    };
  }

  const filteredValues = removeProperties(newValues, FORBIDDEN_PROPERTIES.USER);
  // TODO add this to all other update expressions, or combine them into one
  // Throw an error if all properties are invalid (empty object)
  if (Object.keys(filteredValues.object).length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "All properties are invalid" }),
    };
  }
  const updateUserInput = {
    userId: session.userId,
    ALLOW_FORBIDDEN_KEYS: false,
    newValues: filteredValues.object,
  };

  const [updatedUser, error] = await Users.updateUser(updateUserInput);

  if (error) {
    const formattedError = errorFormatter(error);
    return {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "An error ocurred updating user info",
        ...formattedError,
      }),
    };
  }

  // If a signed in user is updating themselves, update the session state as well
  if (updatedUser.userId === session.userId) {
    const result = keepProperties(updatedUser, [
      "firstName",
      "lastName",
      "email",
      "userId",
      "orgId",
      "canReceiveEmails",
    ]);

    const encryptedCookie = await sealData(result.object, SESSION_SETTINGS);

    const customMessage = filteredValues.removedProperties.length
      ? `We've updated your info, but some properties could not be updated: '${filteredValues.removedProperties.join(
          ", "
        )}'`
      : `We've updated your info!`;
    let response: APIGatewayProxyResultV2 = {
      statusCode: 200,
      cookies: [
        `${DEFAULTS.COOKIE_NAME}=${encryptedCookie}; ${COOKIE_SETTINGS}`,
      ],
      body: JSON.stringify({
        message: customMessage,
      }),
    };
    return response;
  }

  const customMessage = filteredValues.removedProperties.length
    ? `User updated! However, some properties could not be updated: '${filteredValues.removedProperties.join(
        ", "
      )}'`
    : `User updated!`;
  let response: APIGatewayProxyResultV2 = {
    statusCode: 200,
    body: JSON.stringify({
      message: customMessage,
    }),
  };

  return response;
}
