import { NextApiRequest, NextApiResponse } from "next";
const Cookies = require("cookies");
const Keygrip = require("keygrip");
// const keys = new Keygrip(["SEKRIT2", "SEKRIT1"]);
const keys = ["keyboard cat"];

import { GetSessionById } from "../utils/sessions/getSessionById";
import { GetUserById } from "../utils/users/getUserById";
export default function withSessionId(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    let cookies = new Cookies(req, res, { keys: keys });
    let session_id = cookies.get("session_id", { signed: true });
    console.log("In middleware", session_id);
    if (!session_id) {
      console.log("No session ID");
      cookies.set("session_id");
      cookies.set("session_id.sig");
      return res
        .status(401)
        .json({ message: "You have been logged out, please sign in again." });
    }

    // TODO get the user_id and org_id of the session

    try {
      const session = await GetSessionById(session_id);
      console.log("Retrieved session", session);

      if (!session) {
        console.log("No session found");
        cookies.set("session_id");
        cookies.set("session_id.sig");
        return res
          .status(401)
          .json({ message: "Invalid session, please sign in again" });
      }

      const { user_id }: any = session; // TODO types!!

      try {
        const user = await GetUserById(user_id);
        console.log("User by id", user);

        if (!user) {
          console.log("No user here");
          return res.status(400).json({ message: "User does not exist" });
        }

        console.log("Setting session");
        console.log("USER!", user);
        // Can be accessed from any API call afterwards

        req.body = {
          ...req.body,
          user_session: user,
        };
        return handler(req, res); // Essentially next()
      } catch (error) {
        console.error(error);
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
