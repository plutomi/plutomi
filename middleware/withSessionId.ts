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
    console.log(req.headers);
    let session_id = cookies.get("session_id", { signed: true });
    console.log(" SESSION ID in req!", session_id);
    if (!session_id) {
      return res
        .status(401)
        .json({ message: "You have been logged out, please sign in again." });
    }
    // TODO get the user_id and org_id of the session

    try {
      const session = await GetSessionById(session_id);
      console.log("SESSION!", session);
      if (!session) {
        return res
          .status(401)
          .json({ message: "Invalid session, please sign in again" });
      }

      const { user_id }: any = session; // TODO types!!

      try {
        const user = await GetUserById(user_id);

        if (!user) {
          return res.status(400).json({ message: "User does not exist" });
        }

        const { org_id } = user;

        req.headers.user_id = user_id;
        req.headers.user_org_id = org_id; // Prevents cross-org resources from becoming available

        return handler(req, res); // Essentially next()
      } catch (error) {
        return res
          .status(401)
          .json({ message: "Unable to retrieve user data from session" });
      }
    } catch (error) {
      return res.status(401).json({
        message:
          "An error occurred verifying your session, please log in again",
      });
    }
  };
}
