import { APIGatewayProxyResultV2 } from "aws-lambda";
import { withSessionEvent } from "../../types/main";
import * as Users from "../../models/Users";
import errorFormatter from "../../utils/errorFormatter";
import { COOKIE_SETTINGS, DEFAULTS } from "../../Config";
export async function main(
  event: withSessionEvent
): Promise<APIGatewayProxyResultV2> {
  console.log(event);
  const { session } = event.requestContext.authorizer.lambda;

  const [user, error] = await Users.getUserById({ userId: session.userId });

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

  if (!user) {
    return {
      statusCode: 401,
      cookies: [`${DEFAULTS.COOKIE_NAME}=''; ${COOKIE_SETTINGS}`],
      body: JSON.stringify({ message: `Please log in again` }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
}
