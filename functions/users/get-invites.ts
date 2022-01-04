import { APIGatewayProxyResultV2 } from "aws-lambda";
import { withSessionEvent } from "../../types/main";
import * as Users from "../../models/Users";
import Joi from "joi";
import { CustomJoi, NO_SESSION_RESPONSE, JOI_SETTINGS } from "../../Config";
import errorFormatter from "../../utils/errorFormatter";
export async function main(
  event: withSessionEvent
): Promise<APIGatewayProxyResultV2> {
  console.log(event);
  const { session } = event.requestContext.authorizer.lambda;
  if (!session) {
    return NO_SESSION_RESPONSE;
  }

  const pathParameters = event.pathParameters || {};
  const input = {
    pathParameters,
  };

  const schema = CustomJoi.object({
    pathParameters: {
      userId: Joi.string(),
    },
  }).options(JOI_SETTINGS);

  // Validate input
  try {
    await schema.validateAsync(input);
  } catch (error) {
    const response: APIGatewayProxyResultV2 = {
      statusCode: 400,
      body: JSON.stringify({ message: `${error.message}` }),
    };
    return response;
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
