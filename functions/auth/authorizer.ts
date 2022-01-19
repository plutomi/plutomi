import middy from "@middy/core";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { lambdaAuthorizerMiddleware } from "../../Config";
import getSessionFromCookies from "../../utils/getSessionFromCookies";
import * as Users from "../../models/Users";
const main = async (event: APIGatewayProxyEventV2) => {
  const [session, sessionError] = await getSessionFromCookies(event);
  if (sessionError) {
    console.log(`An error ocurred retrieving session info:`, sessionError);
    return {
      isAuthorized: false,
    };
  }

  console.log("Session info:", session);

  const [user, userError] = await Users.getUserById({
    userId: session.userId,
  });

  if (userError) {
    console.log(`An error ocurred retrieving user info:`, userError);
    return {
      isAuthorized: false,
    };
  }

  if (!user) {
    console.log(`User does not exist :(`);
    return {
      isAuthorized: false,
    };
  }
  return {
    isAuthorized: true,
    context: {
      session: user, // TODO naming scheme? Conflicts with UserSessionData. Maybe just event.user.whatever
    },
  };
};

module.exports.main = middy(main).use(lambdaAuthorizerMiddleware);
