import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import Joi from "joi";
import {
  DEFAULTS,
  LOGIN_LINK_SETTINGS,
  LOGIN_METHODS,
  TIME_UNITS,
} from "../../Config";
import formattedResponse from "../../utils/formattedResponse";
import errorFormatter from "../../utils/errorFormatter";
import * as Time from "../../utils/time";
import * as Users from "../../models/Users";
import { nanoid } from "nanoid";
import { sealData } from "iron-session";
export interface RequestLoginLinkAPIBody {
  email: string;
  loginMethod: LOGIN_METHODS;
}
export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log(event);
  const body: RequestLoginLinkAPIBody = JSON.parse(event?.body || "{}");
  const { callbackUrl } = event?.queryStringParameters;

  const schema = Joi.object({
    email: Joi.string().email(),
    loginMethod: Joi.string().valid(LOGIN_METHODS.GOOGLE, LOGIN_METHODS.EMAIL),
    callbackUrl: Joi.string().uri(),
  }).options({ presence: "required", abortEarly: false });

  // Validate input
  try {
    await schema.validateAsync({ ...body, callbackUrl: callbackUrl });
  } catch (error) {
    return formattedResponse(400, { message: `${error.message}` });
  }

  // If a user is signing in for the first time, create an account for them
  let [user, userError] = await Users.getUserByEmail({ email: body.email });

  if (userError) {
    const formattedError = errorFormatter(userError);
    return formattedResponse(formattedError.httpStatusCode, {
      message: "An error ocurred getting your user info",
      ...formattedError,
    });
  }

  if (!user) {
    const [createdUser, createUserError] = await Users.createUser({
      email: body.email,
    });

    if (createUserError) {
      const formattedError = errorFormatter(createUserError);
      return formattedResponse(formattedError.httpStatusCode, {
        message: "An error ocurred creating your account",
        ...formattedError,
      });
    }
    user = createdUser;
  }


  // Allow google login even if a user opted out of emails // TODO revisit once unsubscribe has been implemented
  if (!user.canReceiveEmails && body.loginMethod === LOGIN_METHODS.EMAIL) {
    return formattedResponse(403, {
      message: `${user.email} is unable to receive emails, please reach out to support@plutomi.com to opt back in!`,
    });
  }

  // Check if a user is  making too many requests for a login link by comparing the time of their last link
  const [latestLink, loginLinkError] = await Users.getLatestLoginLink({
    userId: user.userId,
  });

  if (loginLinkError) {
    const formattedError = errorFormatter(loginLinkError);
    return formattedResponse(formattedError.httpStatusCode, {
      message: "An error ocurred getting your login link",
      ...formattedError,
    });
  }
  const timeThreshold = Time.pastISO(10, TIME_UNITS.MINUTES);

  if (
    latestLink &&
    latestLink.createdAt >= timeThreshold &&
    !user.email.endsWith(process.env.DOMAIN_NAME) // Allow admins to send multiple login links in a short timespan
  ) {
    return formattedResponse(400, {
      message: "You're doing that too much, please try again later",
    });
  }

  // Create a login link for them
  const loginLinkId = nanoid(100);
  const loginLinkExpiry = Time.futureISO(15, TIME_UNITS.MINUTES); // when the link expires

  // TODO replace this with iron seal directly
  const seal = await sealData(
    {
      userId: user.userId,
      loginLinkId: loginLinkId,
    },
    LOGIN_LINK_SETTINGS
  );

  const loginLinkUrl = `${
    process.env.API_URL
  }/auth/login?seal=${seal}&callbackUrl=${
    callbackUrl ? callbackUrl : process.env.DOMAIN_NAME + DEFAULTS.REDIRECT
  }`;

  /**
   * Email will be sent asynchronously
   */
  const [success, creationError] = await Users.createLoginLink({
    loginLinkId,
    loginMethod: body.loginMethod,
    loginLinkUrl,
    loginLinkExpiry,
    user,
  });

  if (creationError) {
    const formattedError = errorFormatter(creationError);
    return formattedResponse(formattedError.httpStatusCode, {
      message: "An error ocurred creating your login link",
      ...formattedError,
    });
  }

  // Cannot do serverside redirect from axios POST, client will make the POST instead
  if (body.loginMethod === LOGIN_METHODS.GOOGLE) {
    return formattedResponse(200, { message: loginLinkUrl });
  }

  return formattedResponse(201, {
    message: `We've sent a magic login link to your email!`,
  });
}
