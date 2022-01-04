import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import Joi from "joi";

import {
  DEFAULTS,
  LOGIN_LINK_SETTINGS,
  LOGIN_METHODS,
  TIME_UNITS,
  CustomJoi,
  JOI_SETTINGS,
} from "../../Config";
import errorFormatter from "../../utils/errorFormatter";
import * as Time from "../../utils/time";
import * as Users from "../../models/Users";
import { nanoid } from "nanoid";
import { sealData } from "iron-session";
import { API_URL, DOMAIN_NAME } from "../../Config";
export interface RequestLoginLinkAPIBody {
  email: string;
  loginMethod: LOGIN_METHODS;
}

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log(event);
  const body = JSON.parse(event.body || "{}");
  const queryStringParameters = event.queryStringParameters || {};
  const input = {
    body,
    queryStringParameters,
  };

  const schema = CustomJoi.object({
    body: Joi.object({
      email: Joi.string().email(),
      loginMethod: Joi.string()
        .valid(LOGIN_METHODS.GOOGLE, LOGIN_METHODS.EMAIL)
        .required(),
    }),
    queryStringParameters: {
      callbackUrl: Joi.string().uri(),
    },
  }).options(JOI_SETTINGS);

  // Validate input
  try {
    await schema.validateAsync(input);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: `${error.message}` }),
    };
  }

  const { email, loginMethod } = JSON.parse(event.body);
  const { callbackUrl } = event.queryStringParameters;
  // If a user is signing in for the first time, create an account for them
  let [user, userError] = await Users.getUserByEmail({ email });

  if (userError) {
    const formattedError = errorFormatter(userError);
    const response: APIGatewayProxyResultV2 = {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "An error ocurred getting your user info",
        ...formattedError,
      }),
    };
    return response;
  }

  if (!user) {
    const [createdUser, createUserError] = await Users.createUser({
      email,
    });

    if (createUserError) {
      const formattedError = errorFormatter(createUserError);
      const response: APIGatewayProxyResultV2 = {
        statusCode: formattedError.httpStatusCode,
        body: JSON.stringify({
          message: "An error ocurred creating your account",
          ...formattedError,
        }),
      };
      return response;
    }
    user = createdUser;
  }

  // Allow google login even if a user opted out of emails // TODO revisit once unsubscribe has been implemented
  if (!user.canReceiveEmails && loginMethod === LOGIN_METHODS.EMAIL) {
    const response: APIGatewayProxyResultV2 = {
      statusCode: 403,
      body: JSON.stringify({
        message: `${user.email} is unable to receive emails, please reach out to support@plutomi.com to opt back in!`,
      }),
    };
    return response;
  }

  // Check if a user is  making too many requests for a login link by comparing the time of their last link
  const [latestLink, loginLinkError] = await Users.getLatestLoginLink({
    userId: user.userId,
  });

  if (loginLinkError) {
    const formattedError = errorFormatter(loginLinkError);
    const response: APIGatewayProxyResultV2 = {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "An error ocurred getting your login link",
        ...formattedError,
      }),
    };
    return response;
  }
  const timeThreshold = Time.pastISO(10, TIME_UNITS.MINUTES);

  if (
    latestLink &&
    latestLink.createdAt >= timeThreshold &&
    !user.email.endsWith(DOMAIN_NAME) // Allow admins to send multiple login links in a short timespan
  ) {
    const response: APIGatewayProxyResultV2 = {
      statusCode: 400,
      body: JSON.stringify({
        message: "You're doing that too much, please try again later",
      }),
    };
    return response;
  }

  // Create a login link for them
  const loginLinkId = nanoid(100);
  const loginLinkExpiry = Time.futureISO(15, TIME_UNITS.MINUTES); // when the link expires

  // TODO replace this with iron seal directly
  const seal = await sealData(
    {
      userId: user.userId,
      loginLinkId,
    },
    LOGIN_LINK_SETTINGS
  );

  const loginLinkUrl = `${API_URL}/login?seal=${seal}&callbackUrl=${
    callbackUrl ? callbackUrl : DOMAIN_NAME + DEFAULTS.REDIRECT
  }`;

  /**
   * Email will be sent asynchronously
   */
  const [success, creationError] = await Users.createLoginLink({
    loginLinkId,
    loginMethod,
    loginLinkUrl,
    loginLinkExpiry,
    user,
  });

  if (creationError) {
    const formattedError = errorFormatter(creationError);

    const response: APIGatewayProxyResultV2 = {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "An error ocurred creating your login link",
        ...formattedError,
      }),
    };
    return response;
  }

  // Cannot do serverside redirect from axios POST, client will make the POST instead - // TODO revisit this and just have a router.push?
  if (loginMethod === LOGIN_METHODS.GOOGLE) {
    const response: APIGatewayProxyResultV2 = {
      statusCode: 200,
      body: JSON.stringify({ message: loginLinkUrl }),
    };
    return response;
  }

  const response: APIGatewayProxyResultV2 = {
    statusCode: 201,
    body: JSON.stringify({
      message: `We've sent a magic login link to your email!`,
    }),
  };
  return response;
}
