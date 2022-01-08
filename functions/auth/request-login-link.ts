import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpSecurityHeaders from "@middy/http-security-headers";
import inputOutputLogger from "@middy/input-output-logger";
import middy from "@middy/core";

import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import Joi from "joi";
import {
  DEFAULTS,
  LOGIN_LINK_SETTINGS,
  LOGIN_METHODS,
  TIME_UNITS,
  JOI_SETTINGS,
  WEBSITE_URL,
} from "../../Config";
import errorFormatter from "../../utils/errorFormatter";
import * as Time from "../../utils/time";
import * as Users from "../../models/Users";
import { nanoid } from "nanoid";
import { sealData } from "iron-session";
import { API_URL, DOMAIN_NAME } from "../../Config";

const schema = Joi.object({
  body: {
    email: Joi.string().email(),
    loginMethod: Joi.string()
      .valid(LOGIN_METHODS.GOOGLE, LOGIN_METHODS.EMAIL)
      .required(),
  },
  queryStringParameters: {
    callbackUrl: Joi.string().uri(),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: `${error.message}` }),
    };
  }

  // TODO types
  // @ts-ignore
  const { email, loginMethod } = event.body;
  const { callbackUrl } = event.queryStringParameters;

  // If a user is signing in for the first time, create an account for them
  let [user, userError] = await Users.getUserByEmail({ email });
  if (userError) {
    const formattedError = errorFormatter(userError);
    return {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "An error ocurred getting your user info",
        ...formattedError,
      }),
    };
  }

  if (!user) {
    const [createdUser, createUserError] = await Users.createUser({
      email,
    });

    if (createUserError) {
      const formattedError = errorFormatter(createUserError);
      return {
        statusCode: formattedError.httpStatusCode,
        body: JSON.stringify({
          message: "An error ocurred creating your account",
          ...formattedError,
        }),
      };
    }
    user = createdUser;
  }

  // Allow google login even if a user opted out of emails // TODO revisit once unsubscribe has been implemented
  if (!user.canReceiveEmails && loginMethod === LOGIN_METHODS.EMAIL) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: `${user.email} is unable to receive emails, please reach out to support@plutomi.com to opt back in!`,
      }),
    };
  }

  // Check if a user is  making too many requests for a login link by comparing the time of their last link
  const [latestLink, loginLinkError] = await Users.getLatestLoginLink({
    userId: user.userId,
  });

  if (loginLinkError) {
    const formattedError = errorFormatter(loginLinkError);
    return {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "An error ocurred getting your login link",
        ...formattedError,
      }),
    };
  }
  const timeThreshold = Time.pastISO(10, TIME_UNITS.MINUTES);

  if (
    latestLink &&
    latestLink.createdAt >= timeThreshold &&
    !user.email.endsWith(DOMAIN_NAME) // Allow admins to send multiple login links in a short timespan
  ) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "You're doing that too much, please try again later",
      }),
    };
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
    callbackUrl ? callbackUrl : `${WEBSITE_URL}/${DEFAULTS.REDIRECT}`
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

    return {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "An error ocurred creating your login link",
        ...formattedError,
      }),
    };
  }

  // Cannot do serverside redirect from axios POST, client will make the POST instead - // TODO revisit this and just have a router.push?
  if (loginMethod === LOGIN_METHODS.GOOGLE) {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: loginLinkUrl }),
    };
  }

  // Else, send the email asynchronously w/ step functions
  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `We've sent a magic login link to your email!`,
    }),
  };
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger())
  .use(httpSecurityHeaders());
