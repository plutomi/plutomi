import SendLoginCode from "../../../utils/email/sendLoginCode";
import { NextApiRequest, NextApiResponse } from "next";
import { customAlphabet } from "nanoid/async";
import { GetPastOrFutureTime, GetRelativeTime } from "../../../utils/time";
import CreateLoginCode from "../../../utils/users/createLoginCode";
const alphabet = "023456789ABCDEFGHJKLMNOPQRSTUVWXYZ"; // Removes some characters for clarity
const nanoid = customAlphabet(alphabet, 10);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req;
  const { user_email } = body;
  const login_code = await nanoid();

  const login_code_expiry = GetPastOrFutureTime("future", 15, "minutes", "iso");
  const login_code_expiry_relative_time = GetRelativeTime(
    login_code_expiry as string
  );

  const new_login_code: CreateLoginCodeInput = {
    user_email: user_email,
    login_code: login_code,
    login_code_expiry: login_code_expiry as string,
  };

  const login_code_email: SendLoginCodeEmailInput = {
    recipient: user_email,
    login_code: login_code,
    login_code_relative_expiry: login_code_expiry_relative_time,
  };

  try {
    await CreateLoginCode(new_login_code);
    try {
      await SendLoginCode(login_code_email);
      return res
        .status(201)
        .json({ message: `A login code has been sent to your email` });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `An error ocurred sending your login code ${error}` });
    }
  } catch (error) {
    return res.status(500).json({ message: `${error}` });
  }
};

export default handler;
