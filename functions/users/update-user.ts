import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { withSessionEvent } from "../../types/main";
import Sanitize from "../../utils/sanitize";
import * as Users from "../../models/Users";
import { SessionData } from "../../types/main";
import Joi from "joi";
import {
  COOKIE_NAME,
  COOKIE_SETTINGS,
  DEFAULTS,
  FORBIDDEN_PROPERTIES,
  JOI_SETTINGS,
  NO_SESSION_RESPONSE,
  sessionDataKeys,
  SESSION_SETTINGS,
} from "../../Config";
import { sealData } from "iron-session";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpSecurityHeaders from "@middy/http-security-headers";
import inputOutputLogger from "@middy/input-output-logger";
import middy from "@middy/core";

import getSessionFromCookies from "../../utils/getSessionFromCookies";
import createJoiResponse from "../../utils/createJoiResponse";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const [session, sessionError] = await getSessionFromCookies(event);
  console.log({
    session,
    sessionError,
  });
  if (sessionError) {
    return NO_SESSION_RESPONSE;
  }
  const schema = Joi.object({
    pathParameters: {
      userId: Joi.string(),
    },
    body: {
      newValues: Joi.object(),
    },
  }).options(JOI_SETTINGS);

  try {
    await schema.validateAsync(event);
  } catch (error) {
    return createJoiResponse(error);
  }

  // TODO types
  // @ts-ignore
  const { userId } = pathParameters;
  // @ts-ignore
  const { newValues } = body;

  // TODO RBAC will go here, right now you can only update yourself
  if (userId !== session.userId) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "You cannot update another user" }),
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
    return createSDKErrorResponse(error, "An error ocurred updating user info");
  }

  // If a signed in user is updating themselves, update the session state as well
  if (updatedUser.userId === session.userId) {
    const result = Sanitize("KEEP", sessionDataKeys, updatedUser);

    const encryptedCookie = await sealData(result.object, SESSION_SETTINGS);

    const customMessage = filteredValues.removedKeys.length
      ? `We've updated your info, but some properties could not be updated: '${filteredValues.removedKeys.join(
          ", "
        )}'`
      : `We've updated your info!`;
    return {
      statusCode: 200,
      cookies: [`${COOKIE_NAME}=${encryptedCookie}; ${COOKIE_SETTINGS}`],
      body: JSON.stringify({
        message: customMessage,
      }),
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
    body: JSON.stringify({
      message: customMessage,
    }),
  };
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger())
  .use(httpSecurityHeaders());
