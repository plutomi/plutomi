import { COOKIE_NAME } from "../Config";
import { EventWithUser } from "../types";
import FormattedResponse from "../utils/formatResponse";
import getUserFromSession from "../utils/getUserFromSession";
// Checks if the user has a session
export default function withSession(handler: any) {
  return async (event: EventWithUser) => {
    try {
      const user = await getUserFromSession(event);

      event.user = user;
    } catch (error) {
      if (error.message === "Expired seal") {
        return FormattedResponse(
          401,
          {
            message: `Your session has expired, please log in again!`,
          },
          {
            "Set-Cookie": `${COOKIE_NAME}=''; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
          }
        );
      }

      // TODO other error codes?
      return FormattedResponse(403, {
        message: `Unable to retrieve user from session: ${error.message}`,
      });
    }

    return handler(event);
  };
}
