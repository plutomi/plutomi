import middy from "@middy/core";
import Joi from "joi";
import * as Response from "../../utils/createResponse";
import {
  LOGIN_LINK_SETTINGS,
  SESSION_SETTINGS,
  JOI_SETTINGS,
  COOKIE_SETTINGS,
  WEBSITE_URL,
  COOKIE_NAME,
  TIME_UNITS,
  withDefaultMiddleware,
} from "../../Config";
import * as Time from "../../utils/time";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
import { sealData, unsealData } from "iron-session";
import * as Users from "../../models/Users";
import errorFormatter from "../../utils/errorFormatter";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";

interface APIRequestLoginLinkQueryStrings {
  callbackUrl?: string;
  seal?: string;
}
interface APILoginEvent
  extends Omit<CustomLambdaEvent, "queryStringParameters"> {
  queryStringParameters: APIRequestLoginLinkQueryStrings;
}

const schema = Joi.object({
  queryStringParameters: {
    callbackUrl: Joi.string().uri(),
    seal: Joi.string(),
  },
}).options(JOI_SETTINGS);

const main = async (event: APILoginEvent): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return Response.JOI(error);
  }

  const { callbackUrl, seal } = event.queryStringParameters;

  let userId: string;
  let loginLinkId: string;

  // Validate that the login link is 1. Valid - syntax wise & 2. Has valid data
  try {
    // TODO types
    const data: { userId: string; loginLinkId: string } = await unsealData(
      seal,
      LOGIN_LINK_SETTINGS
    );

    // If the seal expired, these will be undefined. Also undefined for things like seal=123
    if (!data.userId || !data.loginLinkId) {
      return {
        statusCode: 401,
        body: {
          message: "Your link is invalid",
        },
      };
    }

    userId = data.userId;
    loginLinkId = data.loginLinkId;
  } catch (error) {
    return {
      statusCode: 400,
      body: {
        message: "Bad seal",
      },
    };
  }

  const [user, error] = await Users.getUserById({ userId });

  if (error) {
    return createSDKErrorResponse(
      error,
      "An error ocurred using your login link"
    );
  }

  // If a user is deleted between when they made they requested the login link
  // and when they attempted to sign in... somehow
  if (!user) {
    return {
      statusCode: 401,
      body: {
        message: `Please contact support, your user account appears to be deleted.`,
      },
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
        body: {
          message: "Login link no longer valid",
        },
      };
    }

    return createSDKErrorResponse(failed, "Unable to create login event");
  }

  const session = {
    userId,
    expiresAt: Time.futureISO(12, TIME_UNITS.HOURS), // TODO set in config
  };
  const encryptedCookie = await sealData(session, SESSION_SETTINGS);
  const response = {
    cookies: [`${COOKIE_NAME}=${encryptedCookie}; ${COOKIE_SETTINGS}`],
    statusCode: 307,
    headers: {
      Location: callbackUrl,
    },
    body: { message: "Login success!" },
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

//@ts-ignore // TODO types
module.exports.main = middy(main).use(withDefaultMiddleware);
