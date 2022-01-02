import { APIGatewayProxyResultV2 } from "aws-lambda";
import { withSessionEvent } from "../../types/main";
import * as Users from "../../models/Users";
import Joi from "joi";
import { CustomJoi, DEFAULTS, JOI_SETTINGS } from "../../Config";
import errorFormatter from "../../utils/errorFormatter";
export async function main(
  event: withSessionEvent
): Promise<APIGatewayProxyResultV2> {
  console.log(event);
  const { session } = event.requestContext.authorizer.lambda;
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

  if (
    // Block users who arenot in an org from being able to view other users before making the Dynamo call
    session.orgId === DEFAULTS.NO_ORG &&
    session.userId !== userId
  ) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "You are not authorized to view this user",
      }),
    };
  }

  const [requestedUser, error] = await Users.getUserById({
    userId,
  });

  if (error) {
    const formattedError = errorFormatter(error);
    return {
      statusCode: formattedError.httpStatusCode,
      body: JSON.stringify({
        message: "An error ocurred retrieving user info by id",
        ...formattedError,
      }),
    };
  }
  if (!requestedUser) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "User not found" }),
    };
  }

  // TODO RBAC here
  // Only allow viewing users in the same org

  if (session.orgId !== requestedUser.orgId) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "You are not authorized to view this user - not in same org",
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(requestedUser),
  };
}
