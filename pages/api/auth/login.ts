import {
  GetCurrentTime,
  GetPastOrFutureTime,
  GetRelativeTime,
} from "../../../utils/time";
import InputValidation from "../../../utils/inputValidation";
import { NextApiResponse } from "next";
import SendLoginLink from "../../../utils/email/sendLoginLink";
import CreateLoginLink from "../../../utils/loginLinks/createLoginLink";
import { nanoid } from "nanoid";
import withSession from "../../../middleware/withSession";
import { createHash } from "crypto";
import { GetLatestLoginLink } from "../../../utils/loginLinks/getLatestLoginLink";
import { CreateUser } from "../../../utils/users/createUser";
import CreateLoginEvent from "../../../utils/users/createLoginEvent";
import DeleteLoginLink from "../../../utils/loginLinks/deleteLoginLink";
import CleanUser from "../../../utils/clean/cleanUser";
import { GetUserById } from "../../../utils/users/getUserById";
import UpdateLoginLink from "../../../utils/loginLinks/updateLoginLink";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const { body, method, query } = req; // TODO get from body
  const { userEmail, loginMethod } = body;
  const { userId, key, callbackUrl } = query as CustomQuery;
  const login_link_length = 1500;
  const login_link_max_delay_minutes = 10;
  const time_threshold = GetPastOrFutureTime(
    "past",
    login_link_max_delay_minutes,
    "minutes",
    "iso"
  );

  // Creates a login link
  if (method === "POST") {
    try {
      InputValidation({ userEmail });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: `${error.message}` });
    }
    // Creates a user, returns it if already created
    const user = await CreateUser({ userEmail });

    try {
      const latest_link = await GetLatestLoginLink(user.userId);

      // Limit the amount of links sent in a certain period of time
      if (
        latest_link &&
        latest_link.createdAt >= time_threshold &&
        !user.userEmail.endsWith("@plutomi.com")
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

      try {
        await CreateLoginLink({
          user: user,
          login_link_hash: hash,
          login_link_expiry: login_link_expiry,
        });
        const default_redirect = `${process.env.WEBSITE_URL}/dashboard`;
        const login_link = `${process.env.WEBSITE_URL}/api/auth/login?userId=${
          user.userId
        }&key=${secret}&callbackUrl=${
          callbackUrl ? callbackUrl : default_redirect
        }`;

        if (loginMethod === "GOOGLE") {
          return res.status(200).json({ message: login_link });
        }
        try {
          await SendLoginLink({
            recipientEmail: user.userEmail,
            login_link: login_link,
            login_link_relative_expiry: GetRelativeTime(login_link_expiry),
          });
          return res
            .status(201)
            .json({ message: `We've sent a magic login link to your email!` });
        } catch (error) {
          return res.status(500).json({ message: `${error}` }); // TODO error #
        }
      } catch (error) {
        // TODO error #
        return res.status(500).json({ message: `${error}` });
      }
    } catch (error) {
      return res.status(500).json({
        // TODO error #
        message: "An error ocurred getting your info, please try again",
      });
    }
  }

  // Validates the login link when clicked
  if (method === "GET") {
    const validate_login_link_input = {
      userId: userId,
      key: key,
    };
    try {
      InputValidation(validate_login_link_input);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    const latest_login_link = await GetLatestLoginLink(userId);

    if (!latest_login_link) {
      return res.status(400).json({ message: "Invalid link" });
    }

    const hash = createHash("sha512").update(key).digest("hex");

    if (hash != latest_login_link.login_link_hash) {
      /**
       * Someone could try to guess a user ID and the 1500 char long key
       * If they do get someone's ID correct in that 15 minute window to log in AND they key is wrong...
       * Their account will be suspended for 15 minutes until they can generate a new key
       */

      const updated_login_link = {
        ...latest_login_link,
        link_status: "SUSPENDED",
      };

      await UpdateLoginLink({
        userId,
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

    const user = await GetUserById(userId);

    if (user && latest_login_link) {
      // TODO should this be a transaction?
      // Simple timestamp when the user actually logged in
      CreateLoginEvent(userId);

      // Invalidates the last login link while allowing the user to login again if needed
      DeleteLoginLink(userId, latest_login_link.createdAt);

      const clean_user = CleanUser(user as DynamoUser);

      req.session.set("user", clean_user);
      await req.session.save();

      // If a user has invites, redirect them to that page automatically
      if (clean_user.total_invites > 0) {
        res.redirect(`${process.env.WEBSITE_URL}/invites`);
        return;
      }

      res.redirect(callbackUrl);
      return;
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSession(handler);
