import * as Users from "../../models/Users";
import Joi from "joi";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpResponseSerializer from "@middy/http-response-serializer";
import inputOutputLogger from "@middy/input-output-logger";
import middy from "@middy/core";
import {
  NO_SESSION_RESPONSE,
  JOI_SETTINGS,
  MIDDY_SERIALIZERS,
} from "../../Config";
import getSessionFromCookies from "../../utils/getSessionFromCookies";
import createJoiResponse from "../../utils/createJoiResponse";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
import { CustomLambdaEvent } from "../../types/main";

const schema = Joi.object({
  pathParameters: {
    userId: Joi.string(),
  },
}).options(JOI_SETTINGS);

interface APIGetUserInvitesPathParameters {
  userId?: string;
}
interface APIGetUserInvitesEvent
  extends Omit<CustomLambdaEvent, "pathParameters"> {
  pathParameters: APIGetUserInvitesPathParameters;
}

const main = async (event: APIGetUserInvitesEvent) => {
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
    return createSDKErrorResponse(error, "An error ocurred retrieving invites");
  }

  return {
    statusCode: 200,
    body: invites,
  };
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger())
  .use(httpResponseSerializer(MIDDY_SERIALIZERS));
