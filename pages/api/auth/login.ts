import SendLoginCode from "../../../utils/email/sendLoginCode";
import CreateLoginAttempt from "../../../utils/users/createLoginCode";
import { NextApiRequest, NextApiResponse } from "next";
import { GetLatestLoginCode } from "../../../utils/users/getLatestLoginCode";
import { GetCurrentTime } from "../../../utils/time";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req;
  const { user_email, login_code } = body;

  try {
  } catch (error) {}

  try {
    const latest_login_code = await GetLatestLoginCode(user_email);
    if (latest_login_code.login_code != login_code) {
      // TODO mark this as a bad attempt and delete the code
      return res.status(401).json({ message: "Invalid code" });
    }

    if (latest_login_code.expires_at <= GetCurrentTime("iso")) {
      return res.status(401).json({ message: "Code has expired" });
    }

    return res.status(200).json({ message: "Login succesfull!" });
  } catch (error) {
    return res.status(500).json({ message: `${error}` });
  }
};

export default handler;
