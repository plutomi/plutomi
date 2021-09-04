import InputValidation from "../../../utils/inputValidation";
import { NextApiRequest, NextApiResponse } from "next";
import { GetLatestLoginCode } from "../../../utils/users/getLatestLoginCode";
import { GetCurrentTime } from "../../../utils/time";
import { ClaimLoginCode } from "../../../utils/users/claimLoginCode";
import { serialize } from "cookie";
import { withIronSession, Session } from "next-iron-session";
type NextIronRequest = NextApiRequest & { session: Session };
import { session_options } from "../../../Config";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const { user_email, login_code } = body;

  if (method === "POST") {
    req.session.destroy();
    res.setHeader("Set-Cookie", [
      serialize("is_logged_in", "", {
        maxAge: -1,
        path: "/",
      }),
    ]);

    try {
      InputValidation({ user_email, login_code });
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    try {
      const latest_login_code = await GetLatestLoginCode(user_email);
      if (latest_login_code.login_code != login_code) {
        // TODO mark this as a bad attempt and delete the code
        return res.status(401).json({ message: "Invalid code" });
      }

      if (latest_login_code.expires_at <= GetCurrentTime("iso")) {
        return res.status(403).json({ message: "Code has expired" });
      }

      if (latest_login_code.is_claimed) {
        return res
          .status(403)
          .json({ message: "Code has already been claimed" }); // TODO or invalid code msg?
      }

      try {
        const claim_code_input: ClaimLoginCodeInput = {
          user_id: latest_login_code.user_id,
          timestamp: latest_login_code.created_at,
          claimed_at: GetCurrentTime("iso") as string,
        };
        await ClaimLoginCode(claim_code_input);

        req.session.set("user_id", latest_login_code.user_id);
        await req.session.save();

        return res.status(200).json({ message: "Login succesfull!" });
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ message: "An error ocurred claiming your login code" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: `${error}` });
    }
  }
  return res.status(405).json({ message: "Not Allowed" });
};

export default withIronSession(handler, session_options);
