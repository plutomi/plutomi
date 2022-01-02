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

    console.log("Session data", session);
    // Pass the session to the next lambda's event.context
    return {
      isAuthorized: true,
      context: {
        session,
      },
    };
  } catch (error) {
    console.log("Error authorizing", error);
    return {
      isAuthorized: true,
      context: {
        error,
      },
    };
  }
}
