import {
  GetCurrentTime,
  GetPastOrFutureTime,
  GetRelativeTime,
} from "../../../utils/time";
import InputValidation from "../../../utils/inputValidation";
<<<<<<< HEAD
import {  NextApiResponse } from "next";
=======
import { NextApiRequest, NextApiResponse } from "next";
>>>>>>> 73b8a24 (fixed wrong callback url on signin)
import SendLoginLink from "../../../utils/email/sendLoginLink";
import CreateLoginLink from "../../../utils/loginLinks/createLoginLink";
import { nanoid } from "nanoid";
import withSession from "../../../middleware/withSession";
<<<<<<< HEAD
=======
import { Session } from "next-iron-session";
>>>>>>> 73b8a24 (fixed wrong callback url on signin)
import { createHash } from "crypto";
import { GetLatestLoginLink } from "../../../utils/loginLinks/getLatestLoginLink";
import { CreateUser } from "../../../utils/users/createUser";
import CreateLoginEvent from "../../../utils/users/createLoginEvent";
import DeleteLoginLink from "../../../utils/loginLinks/deleteLoginLink";
import CleanUser from "../../../utils/clean/cleanUser";
import { GetUserById } from "../../../utils/users/getUserById";
import UpdateLoginLink from "../../../utils/loginLinks/updateLoginLink";

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  const { body, method, query } = req; // TODO get from body
  const { user_email } = body;
<<<<<<< HEAD
  const { user_id, key, callback_url } = query as CustomQuery;
=======
  const { user_id, key, callback_url } = query;
>>>>>>> 73b8a24 (fixed wrong callback url on signin)
  const login_link_length = 1500;
  const login_link_max_delay_minutes = 10;
  const time_threshold = GetPastOrFutureTime(
    "past",
    login_link_max_delay_minutes,
    "minutes",
    "iso"
  );

  // Creates a login key
  if (method === "POST") {
    try {
      InputValidation({ user_email });
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    try {
      // Returns the user if already there
      const user = await CreateUser({ user_email });

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
<<<<<<< HEAD
        login_link_expiry: login_link_expiry,
=======
        login_link_expiry: login_link_expiry as string,
>>>>>>> 73b8a24 (fixed wrong callback url on signin)
      };

      try {
        const user = await CreateLoginLink(new_login_link_input);
        const default_redirect = `${process.env.PLUTOMI_URL}/dashboard`;
        const login_link = `${process.env.PLUTOMI_URL}/api/auth/login?user_id=${
<<<<<<< HEAD
          user.user_id
        }&key=${secret}&callback_url=${
          callback_url ? callback_url : default_redirect
=======
          user.user_id as string
        }&key=${secret}&callback_url=${
          (callback_url as string) ? (callback_url as string) : default_redirect
>>>>>>> 73b8a24 (fixed wrong callback url on signin)
        }`;

        try {
          const login_link_email_input: SendLoginLinkEmailInput = {
            recipient_email: user_email,
            login_link: login_link,
<<<<<<< HEAD
            login_link_relative_expiry: GetRelativeTime(login_link_expiry),
=======
            login_link_relative_expiry: GetRelativeTime(
              login_link_expiry as string
            ),
>>>>>>> 73b8a24 (fixed wrong callback url on signin)
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

  // Validates the login key
  if (method === "GET") {
    const validate_login_link_input = {
<<<<<<< HEAD
      user_id: user_id,
      key: key,
=======
      user_id: user_id as string,
      key: key as string,
>>>>>>> 73b8a24 (fixed wrong callback url on signin)
    };
    try {
      InputValidation(validate_login_link_input);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

<<<<<<< HEAD
    const latest_login_link = await GetLatestLoginLink(user_id);
=======
    const latest_login_link = await GetLatestLoginLink(user_id as string);
>>>>>>> 73b8a24 (fixed wrong callback url on signin)

    if (!latest_login_link) {
      return res.status(400).json({ message: "Invalid link" });
    }

<<<<<<< HEAD
    const hash = createHash("sha512").update(key).digest("hex");
=======
    const hash = createHash("sha512")
      .update(key as string)
      .digest("hex");
>>>>>>> 73b8a24 (fixed wrong callback url on signin)

    if (hash != latest_login_link.login_link_hash) {
      /**
       * Someone could try to guess a user ID and the 1500 char long key
       * If they do get someone's ID correct in that 15 minute window to sign in AND they key is wrong...
       * Their account will be suspended for 15 minutes until they can generate a new key
       */

      const updated_login_link = {
        ...latest_login_link,
        link_status: "SUSPENDED",
      };

      await UpdateLoginLink({
        user_id,
        updated_login_link,
      });

      return res.status(401).json({
        message: `Your login link has been suspended. Please try again later.`,
      });
    }

    // Lock account if already suspended
    if (latest_login_link.link_status === "SUSPENDED") {
      return res.status(401).json({
        message: `Your login link has been suspended. Please try again later or email support@plutomi.com`,
      });
    }

    if (latest_login_link.expires_at <= GetCurrentTime("iso")) {
      return res.status(401).json({
        message: `Your login link has expired.`,
      });
    }

    // TODO delete link
<<<<<<< HEAD
    const user = await GetUserById(user_id);

    if (user && latest_login_link) {
      CreateLoginEvent(user_id);

      // Invalidates the last login link while allowing the user to login again if needed
      DeleteLoginLink(user_id, latest_login_link.created_at);
=======
    const user = await GetUserById(user_id as string);

    if (user && latest_login_link) {
      CreateLoginEvent(user_id as string);

      // Invalidates the last login link while allowing the user to login again if needed
      DeleteLoginLink(user_id as string, latest_login_link.created_at);
>>>>>>> 73b8a24 (fixed wrong callback url on signin)

      const clean_user = CleanUser(user as DynamoUser);
      req.session.set("user", clean_user);
      await req.session.save();
<<<<<<< HEAD
      res.redirect(callback_url);
=======
      res.redirect(callback_url as string);
>>>>>>> 73b8a24 (fixed wrong callback url on signin)
      return;
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
}

export default withSession(handler);
