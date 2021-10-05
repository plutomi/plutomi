import { GetPastOrFutureTime, GetRelativeTime } from "../../../utils/time";
import CreateLoginCode from "../../../utils/loginCodes/createLoginCode";
import SendLoginCode from "../../../utils/email/sendLoginCode";
import InputValidation from "../../../utils/inputValidation";
import { NextApiRequest, NextApiResponse } from "next";
import { customAlphabet } from "nanoid/async";

const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Removes some characters for clarity
const nanoid = customAlphabet(alphabet, 16);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const { user_email }: APICreateLoginCodeInput = body;

  if (method === "POST") {
    try {
      InputValidation({ user_email });
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    const login_code = await nanoid();

    const login_code_expiry = GetPastOrFutureTime(
      "future",
      15,
      "minutes",
      "iso"
    );
    const login_code_expiry_relative_time = GetRelativeTime(
      login_code_expiry as string
    );

    const new_login_code: CreateLoginCodeInput = {
      user_email: user_email,
      login_code: login_code,
      login_code_expiry: login_code_expiry as string,
    };

    try {
      await CreateLoginCode(new_login_code);
      try {
        const login_code_email: SendLoginCodeEmailInput = {
          recipient: user_email,
          login_code: login_code,
          login_code_relative_expiry: login_code_expiry_relative_time,
        };
        await SendLoginCode(login_code_email);
        return res
          .status(201)
          .json({ message: `A login code has been sent to your email` });
      } catch (error) {
        return res.status(500).json({ message: `${error}` });
      }
    } catch (error) {
      return res.status(500).json({ message: `${error}` });
    }
  }
  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
