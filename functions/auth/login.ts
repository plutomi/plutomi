import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import inputOutputLogger from "@middy/input-output-logger";
import createJoiResponse from "../../utils/createJoiResponse";
import httpResponseSerializer from "@middy/http-response-serializer";
import middy from "@middy/core";
import Joi from "joi";
import {
  LOGIN_LINK_SETTINGS,
  LOGIN_METHODS,
  SESSION_SETTINGS,
  JOI_SETTINGS,
  COOKIE_SETTINGS,
  WEBSITE_URL,
  sessionDataKeys,
  COOKIE_NAME,
  MIDDY_SERIALIZERS,
} from "../../Config";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
import { sealData, unsealData } from "iron-session";
import Sanitize from "../../utils/sanitize";
import * as Users from "../../models/Users";
import errorFormatter from "../../utils/errorFormatter";

interface RequestLoginLinkAPIBody {
  email: string;
  loginMethod: LOGIN_METHODS;
}

const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const schema = Joi.object({
    queryStringParameters: {
      callbackUrl: Joi.string().uri(),
      seal: Joi.string(),
    },
  }).options(JOI_SETTINGS);

  // Validate input
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return createJoiResponse(error);
  }

  const { callbackUrl, seal } = event.queryStringParameters;

  let userId: string;
  let loginLinkId: string;

  // Validate that the login link is 1. Valid - syntax wise & 2. Has valid data
  try {
    const data: { userId: string; loginLinkId: string } = await unsealData(
      seal,
      LOGIN_LINK_SETTINGS
    );

    // If the seal expired, these will be undefined. Also undefined for things like seal=123
    if (!data.userId || !data.loginLinkId) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: "Your link is invalid",
        }),
      };
    }

    userId = data.userId;
    loginLinkId = data.loginLinkId;
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Bad seal",
      }),
    };
  }

  const [user, error] = await Users.getUserById({ userId }); // TODO async error handling

  if (error) {
    return createSDKErrorResponse(
      error,
      "An error ocurred using your login link"
    );
  }

  // If a user is deleted between when they made they requested the login link and they attempted to sign in
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: `Please contact support, your user account appears to be deleted.`,
      }),
    };
  }

  // If this is a new user, an asynchronous welcome email is sent through step functions
  // It triggers if the user.verifiedEmail is false
  const [success, failed] = await Users.createLoginEventAndDeleteLoginLink({
    loginLinkId,
    user,
  });

  if (failed) {
    const formattedError = errorFormatter(failed);
    // If login link has been used, it will throw this error
    const LOGIN_LINK_ALREADY_USED_ERROR = `Transaction cancelled, please refer cancellation reasons for specific reasons [None, ConditionalCheckFailed]`;
    if (formattedError.errorMessage === LOGIN_LINK_ALREADY_USED_ERROR) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: "Login link no longer valid",
        }),
      };
    }

    return createSDKErrorResponse(failed, "Unable to create login event");
  }

  const result = Sanitize("KEEP", sessionDataKeys, user);

  const encryptedCookie = await sealData(result.object, SESSION_SETTINGS);

  const response = {
    cookies: [`${COOKIE_NAME}=${encryptedCookie}; ${COOKIE_SETTINGS}`],
    statusCode: 307,
    headers: {
      Location: callbackUrl,
    },
    body: JSON.stringify({ message: "Login success!" }),
  };

  // If a user has invites, redirect them to the invites page on login regardless of the callback url
  if (user.totalInvites > 0) {
    return {
      ...response,
      headers: {
        Location: `${WEBSITE_URL}/invites`,
      },
    };
  }
  // Else, redirect to the callback url
  return response;
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger())
  .use(httpResponseSerializer(MIDDY_SERIALIZERS));
