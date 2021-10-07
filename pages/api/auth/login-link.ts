import { GetPastOrFutureTime, GetRelativeTime } from "../../../utils/time";
import InputValidation from "../../../utils/inputValidation";
import { NextApiRequest, NextApiResponse } from "next";
import SendLoginLink from "../../../utils/email/sendLoginLink";
import CreateLoginLink from "../../../utils/loginLinks/createLoginLink";
import { nanoid } from "nanoid";
import { createHash } from "crypto";
import { GetLatestLoginLink } from "../../../utils/loginLinks/getLatestLoginLink";
import { GetUserByEmail } from "../../../utils/users/getUserByEmail";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req; // TODO get from body
  const { user_email, callback_url } = body;

  const login_link_length = 1500;
  const login_link_max_delay_minutes = 10;
  const time_threshold = GetPastOrFutureTime(
    "past",
    login_link_max_delay_minutes,
    "minutes",
    "iso"
  );

  if (method === "POST") {
    try {
      InputValidation({ user_email });
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    try {
      const user = await GetUserByEmail(user_email);
      const latest_link = await GetLatestLoginLink(user.user_id);

      // Limit the amount of links sent in a certain period of time
      if (
        latest_link &&
        latest_link.created_at >= time_threshold &&
        !user_email.endsWith("@plutomi.com")
      ) {
        return res.status(400).json({
          message: "You're doing that too much, please try again later",
        });
      }

      const secret = nanoid(login_link_length);
      const hash = createHash("sha512").update(secret).digest("hex");

      const login_link_expiry = GetPastOrFutureTime(
        "future",
        15,
        "minutes",
        "iso"
      );

      const new_login_link_input: CreateLoginLinkInput = {
        user_email: user_email,
        login_link_hash: hash,
        login_link_expiry: login_link_expiry as string,
      };

      try {
        const user: DynamoUser = await CreateLoginLink(new_login_link_input);
        const clickable_link = `${
          process.env.NEXT_PUBLIC_NEXTAUTH_URL
        }/login?user_id=${user.user_id as string}&key=${secret}&callback_url=${
          callback_url
            ? callback_url
            : `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard`
        }`;

        try {
          const login_link_email_input: SendLoginLinkEmailInput = {
            recipient: user_email,
            login_link: clickable_link,
            login_link_relative_expiry: GetRelativeTime(
              login_link_expiry as string
            ),
          };
          await SendLoginLink(login_link_email_input);
          return res
            .status(201)
            .json({ message: `We've sent a magic login link to your email!` });
        } catch (error) {
          return res.status(500).json({ message: `${error}` });
        }
      } catch (error) {
        return res.status(500).json({ message: `${error}` });
      }
    } catch (error) {
      return res.status(500).json({
        message: "An error ocurred getting your info, please try again",
      });
    }
  }
  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
