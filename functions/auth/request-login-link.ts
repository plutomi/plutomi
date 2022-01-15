import middy from "@middy/core";
import Joi from "joi";
import {
  DEFAULTS,
  LOGIN_LINK_SETTINGS,
  TIME_UNITS,
  JOI_SETTINGS,
  WEBSITE_URL,
  withDefaultMiddleware,
  ID_LENGTHS,
} from "../../Config";
import * as Time from "../../utils/time";
import * as Users from "../../models/Users";
import { nanoid } from "nanoid";
import { sealData } from "iron-session";
import { API_URL, DOMAIN_NAME } from "../../Config";
import * as Response from "../../utils/customResponse";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";

interface APIRequestLoginLinkBody {
  email?: string;
}
interface APIRequestLoginLinkQueryStrings {
  callbackUrl?: string;
}
interface APIRequestLoginLinkEvent
  extends Omit<CustomLambdaEvent, "body" | "queryStringParameters"> {
  body: APIRequestLoginLinkBody;
  queryStringParameters: APIRequestLoginLinkQueryStrings;
}

const schema = Joi.object({
  body: {
    email: Joi.string().email(),
  },
  queryStringParameters: {
    callbackUrl: Joi.string().uri().optional(),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIRequestLoginLinkEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return Response.JOI(error);
  }

  const { email } = event.body;
  const { callbackUrl } = event.queryStringParameters;

  // If a user is signing in for the first time, create an account for them
  let [user, userError] = await Users.getUserByEmail({ email });
  if (userError) {
    return Response.SDK(userError, "An error ocurred getting your user info");
  }

  if (!user) {
    const [createdUser, createUserError] = await Users.createUser({
      email,
    });
    if (createUserError) {
      return Response.SDK(
        createUserError,
        "An error ocurred creating your account"
      );
    }
    user = createdUser;
  }

  // TODO move this to comms machine? This would be for login links and its pretty crucial to know if I unsubscribed
  if (!user.canReceiveEmails) {
    return {
      statusCode: 200,
      body: {
        message: `'${user.email}' is unable to receive emails, please reach out to support@plutomi.com to opt back in!`,
      },
    };
  }

  // Check if a user is  making too many requests for a login link by comparing the time of their last link
  const [latestLink, loginLinkError] = await Users.getLatestLoginLink({
    userId: user.userId,
  });

  if (loginLinkError) {
    return Response.SDK(
      loginLinkError,
      "An error ocurred getting your login link"
    );
  }
  const timeThreshold = Time.pastISO(10, TIME_UNITS.MINUTES);
  if (
    latestLink &&
    latestLink.createdAt >= timeThreshold &&
    !user.email.endsWith(DOMAIN_NAME) // Allow admins to send multiple login links in a short timespan
  ) {
    return {
      statusCode: 403,
      body: {
        message: "You're doing that too much, please try again later",
      },
    };
  }

  // Create a login link for them
  const loginLinkId = nanoid();
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
    loginLinkUrl,
    loginLinkExpiry,
    user,
  });

  if (creationError) {
    return Response.SDK(
      creationError,
      "An error ocurred creating your login link"
    );
  }

  // Else, send the email asynchronously w/ step functions
  return {
    statusCode: 201,
    body: {
      message: `We've sent a magic login link to your email!`,
    },
  };
};

//@ts-ignore // TODO types
module.exports.main = middy(main).use(withDefaultMiddleware);
