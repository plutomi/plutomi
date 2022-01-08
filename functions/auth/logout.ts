import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { COOKIE_NAME, COOKIE_SETTINGS } from "../../Config";

// TODO create logoout event in Dynamo
export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  return {
    statusCode: 200,
    cookies: [`${COOKIE_NAME}=''; Max-Age=-1; ${COOKIE_SETTINGS}`],
    body: JSON.stringify({ message: "You've succesfully logged out!" }),
  };
}
