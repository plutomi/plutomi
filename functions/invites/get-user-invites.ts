import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import * as Users from "../../models/Users";
import Joi from "joi";
import { NO_SESSION_RESPONSE, JOI_SETTINGS } from "../../Config";
import errorFormatter from "../../utils/errorFormatter";
import getSessionFromCookies from "../../utils/getSessionFromCookies";
export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const [session, sessionError] = await getSessionFromCookies(event);
  console.log({
    session,
    sessionError,
  });
  if (sessionError) {
    return NO_SESSION_RESPONSE;
  }

  const pathParameters = event.pathParameters || {};
  const input = {
    pathParameters,
  };

  const schema = Joi.object({
    pathParameters: {
      userId: Joi.string(),
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

  const { userId } = pathParameters;
  if (userId !== session.userId) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "You cannot view invites for this user",
      }),
    };
  }
  const [invites, error] = await Users.getInvitesForUser({
    userId: session.userId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "An error ocurred retrieving invites",
        ...formattedError,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(invites),
  };
}
