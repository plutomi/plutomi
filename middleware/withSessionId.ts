import { NextApiRequest, NextApiResponse } from "next";
import { GetSessionById } from "../utils/sessions/getSessionById";
import { GetUserById } from "../utils/users/getUserById";

const Cookies = require("cookies");
const Keygrip = require("keygrip");
const { KEYGRIP_1, KEYGRIP_2 } = process.env;
const keys = new Keygrip([KEYGRIP_1, KEYGRIP_2]);

/**
 *
 * @param handler - Middleware to check cookies and pass the user info along to the next API call
 *
 *
 */
export default function withSessionId(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    /**
     * 1. Check for cookies. If there are none that match the signature, deny access
     */
    let cookies = new Cookies(req, res, { keys: keys });
    let session_id = cookies.get("session_id", { signed: true });
    if (!session_id) {
      cookies.set("session_id");
      cookies.set("session_id.sig");
      return res
        .status(401)
        .json({ message: "You have been logged out, please sign in again." });
    }

    try {
      /**
       * 2. If a cookie exists, get the session ID info
       */
      const session = await GetSessionById(session_id);

      /**
       * 3. If there is no session by that session ID, deny access
       */
      if (!session) {
        cookies.set("session_id");
        cookies.set("session_id.sig");
        return res
          .status(401)
          .json({ message: "Invalid session, please sign in again" });
      }

      /**
       * 4. If a session exists, get the user ID from the session
       */
      const { user_id }: any = session; // TODO types!!

      try {
        /**
         * 5. Get the user's latest info
         * The reason we want to do this is because if an admin changes this user's role (as an example)
         * We don't want them to still have 'MANAGER' privilages when they are now just a 'SPECIALIST'
         */
        const user = await GetUserById(user_id);

        /**
         * 6. If no user exists by that ID (not sure how this would be possible) - deny access
         */
        if (!user) {
          return res.status(401).json({ message: "User does not exist" });
        }

        /**
         * 7. Set a user_info variable in the request body
         * This can be accessed from any API call down the line
         */

        req.body = {
          ...req.body,
          user_info: user,
        };
        return handler(req, res); // Essentially next()
      } catch (error) {
        return res.status(401).json({
          message: "Unable to retrieve user data from session",
          error: error,
        });
      }
    } catch (error) {
      return res.status(401).json({
        message:
          "An error occurred verifying your session, please log in again",
      });
    }
  };
}
