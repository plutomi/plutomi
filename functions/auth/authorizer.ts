import { APIGatewayProxyEventV2 } from "aws-lambda";
import { COOKIE_SETTINGS, DEFAULTS, LOGIN_METHODS } from "../../Config";
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
      // TODO this is extremely annoying to have to do this,
      // but we cannot set headers in the custom authorizer because of.. reasons..
      // So we have to check for undefined in the lambda themselves which
      // defeats the WHOLE PURPOSE of separating authorizer logic...
      context: {
        session: undefined,
      },
    };
  }
}
