import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import Joi from "joi";
import {
  DEFAULTS,
  DOMAIN_NAME,
  LOGIN_LINK_SETTINGS,
  LOGIN_METHODS,
} from "../../Config";
import errorFormatter from "../../utils/errorFormatter";
import * as Users from "../../models/Users";
import { sealData, unsealData } from "iron-session";
import { keepProperties, removeProperties } from "../../utils/sanitize";
import { DynamoNewApplicant, DynamoNewUser } from "../../types/dynamo";
export interface RequestLoginLinkAPIBody {
  email: string;
  loginMethod: LOGIN_METHODS;
}
export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log(event);
  const { callbackUrl, seal } = event?.queryStringParameters;

  const schema = Joi.object({
    seal: Joi.string(),
    callbackUrl: Joi.string().uri(),
  }).options({ presence: "required", abortEarly: false });

  // Validate URL
  try {
    await schema.validateAsync({ callbackUrl: callbackUrl, seal: seal });
  } catch (error) {
    const response: APIGatewayProxyResultV2 = {
      statusCode: 400,
      body: JSON.stringify({
        message: `${error.body.message}`,
      }),
    };
    return response;
  }
  let userId: string;
  let loginLinkId: string;

  // Validate that the login link is 1. Valid - syntax wise & 2. Has valid data
  try {
    const data: { userId: string; loginLinkId: string } = await unsealData(
      seal,
      LOGIN_LINK_SETTINGS
    );
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
  // If the link expired, these will be undefined
  if (!userId || !loginLinkId) {
    const response: APIGatewayProxyResultV2 = {
      statusCode: 401,
      body: JSON.stringify({
        message: "Your link is invalid",
      }),
    };
    return response;
  }

  const [user, error] = await Users.getUserById({ userId }); // TODO async error handling

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

  type SessionData = Pick<
    DynamoNewUser,
    "firstName" | "lastName" | "orgId" | "GSI1SK" | "userId"
  >;

  const cleanUser: SessionData = keepProperties(user, [
    "firstName",
    "lastName",
    "GSI1SK",
    "userId",
    "orgId",
  ]);

  const encryptedCookie = await sealData(cleanUser, {
    password:
      "fasdhiopuhdsafoiahdiojuashiodhasiodhiosahdioahsiodkhasihdiashdijashdkjlashdkjlashdkljahsdkljhasldkhaskdljhaskldjhas",
    ttl: 900000,
  });
  const response: APIGatewayProxyResultV2 = {
    cookies: [
      `${DEFAULTS.COOKIE_NAME}=${encryptedCookie}; Secure; httpOnly; sameSite=Lax; Domain=${DOMAIN_NAME}`,
    ],
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
        Location: `${DOMAIN_NAME}/invites`,
      },
    };
  }
  // Else, redirect to the callback url
  return response;
}
