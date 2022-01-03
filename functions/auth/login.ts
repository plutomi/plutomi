import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import Joi from "joi";
import {
  CustomJoi,
  DEFAULTS,
  LOGIN_LINK_SETTINGS,
  LOGIN_METHODS,
  SESSION_SETTINGS,
  JOI_SETTINGS,
  COOKIE_SETTINGS,
  WEBSITE_URL,
} from "../../Config";
import errorFormatter from "../../utils/errorFormatter";
import { sealData, unsealData } from "iron-session";
import { keepProperties } from "../../utils/sanitize";
import * as Users from "../../models/Users";

export interface RequestLoginLinkAPIBody {
  email: string;
  loginMethod: LOGIN_METHODS;
}
export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log(event);
  const queryStringParameters = event.queryStringParameters || {};
  const input = {
    queryStringParameters,
  };

  const schema = CustomJoi.object({
    queryStringParameters: {
      callbackUrl: Joi.string().uri(),
      seal: Joi.string(),
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
      const response: APIGatewayProxyResultV2 = {
        statusCode: 401,
        body: JSON.stringify({
          message: "Your link is invalid",
        }),
      };
      return response;
    }

    userId = data.userId;
    loginLinkId = data.loginLinkId;
  } catch (error) {
    const response: APIGatewayProxyResultV2 = {
      statusCode: 400,
      body: JSON.stringify({
        message: "Bad seal",
      }),
    };
    return response;
  }

  console.log("Getting user", userId);
  const [user, error] = await Users.getUserById({ userId }); // TODO async error handling

  console.log("User found", user);
  if (error) {
    const formattedError = errorFormatter(error);

    const response: APIGatewayProxyResultV2 = {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "An error ocurred using your login link",
        ...formattedError,
      }),
    };
    return response;
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
      const response: APIGatewayProxyResultV2 = {
        statusCode: 401,
        body: JSON.stringify({
          message: "Login link no longer valid",
        }),
      };
      return response;
    }

    const response: APIGatewayProxyResultV2 = {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "Unable to create login event",
        ...formattedError,
      }),
    };
    return response;
  }

  const result = keepProperties(user, [
    "firstName",
    "lastName",
    "email",
    "userId",
    "orgId",
    "canReceiveEmails",
  ]);

  const encryptedCookie = await sealData(result.object, SESSION_SETTINGS);
  const response: APIGatewayProxyResultV2 = {
    cookies: [`${DEFAULTS.COOKIE_NAME}=${encryptedCookie}; ${COOKIE_SETTINGS}`],
    statusCode: 307,
    headers: {
      Location: callbackUrl,
    },
    body: JSON.stringify({ message: "Success, check cookies. " }),
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
}
