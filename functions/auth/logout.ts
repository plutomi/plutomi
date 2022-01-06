import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { COOKIE_NAME, COOKIE_SETTINGS, DEFAULTS } from "../../Config";

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log(event);
  // All this does is delete the cookie with Max-Age
  return {
    statusCode: 200,
    cookies: [`${COOKIE_NAME}=''; Max-Age=-1; ${COOKIE_SETTINGS}`],
    body: JSON.stringify({ message: "You've succesfully logged out!" }),
  };
}
