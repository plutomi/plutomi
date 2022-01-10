import * as Users from "../../models/Users";
import {
  COOKIE_NAME,
  COOKIE_SETTINGS,
  withSessionMiddleware,
} from "../../Config";
import middy from "@middy/core";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
const main = async (
  event: CustomLambdaEvent // TODO create type
): Promise<CustomLambdaResponse> => {
  const [user, error] = await Users.getUserById({
    userId: event.session.userId,
  });

  if (error) {
    return createSDKErrorResponse(
      error,
      "An error ocurred retrieving your info"
    );
  }

  // User was deleted for some reason
  if (!user) {
    return {
      statusCode: 401,
      cookies: [`${COOKIE_NAME}=''; Max-Age=-1; ${COOKIE_SETTINGS}`],
      body: { message: "Please log in again" },
    };
  }
  return {
    statusCode: 200,
    body: user,
  };
};
// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withSessionMiddleware);
