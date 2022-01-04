import { APIGatewayProxyResultV2 } from "aws-lambda";
import { withSessionEvent } from "../../types/main";
import * as Users from "../../models/Users";
import errorFormatter from "../../utils/errorFormatter";
import { COOKIE_SETTINGS, DEFAULTS, NO_SESSION_RESPONSE } from "../../Config";
export async function main(
  event: withSessionEvent
): Promise<APIGatewayProxyResultV2> {
  console.log(event);
  const { session } = event.requestContext.authorizer.lambda;
  if (!session) {
    return NO_SESSION_RESPONSE;
  }

  const [user, error] = await Users.getUserById({ userId: session.userId });

  console.log("user", user);
  if (error) {
    const formattedError = errorFormatter(error);
    return {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "An error ocurred retrieving self info",
        ...formattedError,
      }),
    };
  }

  // User was deleted for some reason
  !user && NO_SESSION_RESPONSE;

  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
}
