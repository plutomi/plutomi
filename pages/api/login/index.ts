import { NextApiRequest, NextApiResponse } from "next";
import { CreateSession } from "../../../utils/sessions/login";
import { VerifyPassword } from "../../../utils/passwords";
const Cookies = require("cookies");
import withSessionId from "../../../middleware/withSessionId";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const { user_email, user_password } = body;
  const keys = ["keyboard cat"];

  if (method === "POST") {
    try {
      const password_match = await VerifyPassword(user_email, user_password);
      if (!password_match) {
        // TODO add login attempt here, mark it down and check for 3 req < 1 min
        return res.status(400).json({ message: "Password is incorrect" });
      }
      try {
        const session = await CreateSession(user_email);
        let cookies = new Cookies(req, res, { keys: keys });
        cookies.set("session_id", session, { signed: true });
        // https://www.rdegges.com/2018/please-stop-using-local-storage/

        // TODO set secure true and samesite
        return res.status(201).json({ message: "Logged in succesfully!" });
      } catch (error) {
        // TODO add error logger
        return res
          .status(400) // TODO change #
          .json({ message: `${error}` });
      }
    } catch (error) {
      return res.status(400).json({ message: `${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
