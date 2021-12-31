import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { COOKIE_SETTINGS, DEFAULTS } from "../../Config";

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log(event);
  // All this does is delete the cookie with Max-Age
  const response: APIGatewayProxyResultV2 = {
    statusCode: 200,
    cookies: [`${DEFAULTS.COOKIE_NAME}=''; ${COOKIE_SETTINGS}`],
    body: JSON.stringify({ message: "You've succesfully logged out!" }),
  };
  return response;
}
