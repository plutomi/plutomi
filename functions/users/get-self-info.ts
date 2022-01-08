import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { withSessionEvent } from "../../types/main";
import * as Users from "../../models/Users";
import errorFormatter from "../../utils/errorFormatter";
import { COOKIE_SETTINGS, DEFAULTS, NO_SESSION_RESPONSE } from "../../Config";
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
  const [user, error] = await Users.getUserById({ userId: session.userId });

  if (error) {
    const formattedError = errorFormatter(error);
    return {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "An error ocurred retrieving your info",
        ...formattedError,
      }),
    };
  }

  // User was deleted for some reason
  if (!user) {
    return NO_SESSION_RESPONSE;
  }
  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
}
