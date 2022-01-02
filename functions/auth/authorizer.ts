import { APIGatewayProxyEventV2 } from "aws-lambda";
import { LOGIN_METHODS } from "../../Config";
import getSessionFromCookies from "../../utils/getSessionFromCookies";

export interface RequestLoginLinkAPIBody {
  email: string;
  loginMethod: LOGIN_METHODS;
}
export async function main(event: APIGatewayProxyEventV2) {
  console.log(event);
  const cookies = event.cookies || [];

  try {
    const session = await getSessionFromCookies(cookies);
    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: "Success", session, event }),
    };
    return response;
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error, message: error.message, event }),
    };
  }
}
