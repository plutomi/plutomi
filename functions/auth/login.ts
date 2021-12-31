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
import { unsealData } from "iron-session";
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

  // Validates the login link when clicked
  const { userId, loginLinkId }: { userId: string; loginLinkId: string } =
    await unsealData(seal, LOGIN_LINK_SETTINGS); // TODO replace with iron seal

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
        message: "An error ocurred getting your user info",
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
    const response: APIGatewayProxyResultV2 = {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "Unable to create login event",
        ...formattedError,
      }),
    };
    return response;
  }

  //   const cleanedUser = Sanitize.clean(user, ENTITY_TYPES.USER); // TODO not working!
  /**
   * Get the user's org invites if they're not in an org.
   * The logic here being, if a user is in an org, what are the chances they're going to join another?
   *  TODO maybe revisit this?
   */

  let userInvites = []; // TODO types array of org invite
  if (user.orgId === DEFAULTS.NO_ORG) {
    const [invites, inviteError] = await Users.getInvitesForUser({
      userId: user.userId,
    });

    if (inviteError) {
      const formattedError = errorFormatter(inviteError);
      const response: APIGatewayProxyResultV2 = {
        statusCode: formattedError.httpStatusCode,
        body: JSON.stringify({
          message: "An error ocurred getting your invites",
          ...formattedError,
        }),
      };
      return response;
    }
    userInvites = invites;
  }

  //  TODO cookies. Encrypt the user
  //   req.session.user = cleanedUser;
  //   req.session.user.totalInvites = userInvites.length;
  //   await req.session.save();

  // TODO token with session info
  const response: APIGatewayProxyResultV2 = {
    cookies: ["plutomi-cookie=beansbeansbeans; Secure; httpOnly"],
    statusCode: 200,
    headers: {
      Location: callbackUrl,
    },
    body: JSON.stringify({ message: "Success, check cookies. " }),
  };

  // If a user has invites, redirect them to the invites page on login regardless of the callback url
  if (userInvites.length) {
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
