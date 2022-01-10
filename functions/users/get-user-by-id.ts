import * as Users from "../../models/Users";
import Joi from "joi";
import {
  DEFAULTS,
  JOI_SETTINGS,
  MIDDY_SERIALIZERS,
  NO_SESSION_RESPONSE,
} from "../../Config";
import httpResponseSerializer from "@middy/http-response-serializer";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import inputOutputLogger from "@middy/input-output-logger";
import middy from "@middy/core";
import getSessionFromCookies from "../../utils/getSessionFromCookies";
import createJoiResponse from "../../utils/createJoiResponse";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
import { CustomLambdaEvent } from "../../types/main";
const schema = Joi.object({
  pathParameters: {
    userId: Joi.string(),
  },
}).options(JOI_SETTINGS);

interface APIUserByIdPathParameters {
  userId?: string;
}
interface APIUserByIdEvent extends Omit<CustomLambdaEvent, "pathParameters"> {
  pathParameters: APIUserByIdPathParameters;
}

const main = async (event: APIUserByIdEvent) => {
  const [session, sessionError] = await getSessionFromCookies(event);
  console.log({
    session,
    sessionError,
  });
  if (sessionError) {
    return NO_SESSION_RESPONSE;
  }

  try {
    await schema.validateAsync(event);
  } catch (error) {
    return createJoiResponse(error);
  }

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

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger())
  .use(httpResponseSerializer(MIDDY_SERIALIZERS));
