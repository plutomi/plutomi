import { getCurrentTime, getPastOrFutureTime } from "../../../utils/time";
import { NextApiResponse } from "next";

import withSession from "../../../middleware/withSession";
import { createHash } from "crypto";
import { getLatestLoginLink } from "../../../utils/loginLinks/getLatestLoginLink";
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
  const loginLinkLength = 1500;
  const login_link_max_delay_minutes = 10;
  const timeThreshold = getPastOrFutureTime(
    "past",
    login_link_max_delay_minutes,
    "minutes",
    "iso"
  );

  // Validates the login link when clicked
  if (method === "GET") {
    const validate_login_link_input = {
      userId: userId,
      key: key,
    };

    const latestLoginLink = await getLatestLoginLink(userId);

    if (!latestLoginLink) {
      return res.status(400).json({ message: "Invalid link" });
    }

    const hash = createHash("sha512").update(key).digest("hex");

    if (hash != latestLoginLink.loginLinkHash) {
      /**
       * Someone could try to guess a user ID and the 1500 char long key
       * If they do get someone's ID correct in that 15 minute window to log in AND they key is wrong...
       * Their account will be suspended for 15 minutes until they can generate a new key
       */

      const updatedLoginLink = {
        ...latestLoginLink,
        linkStatus: "SUSPENDED",
      };

      await UpdateLoginLink({
        userId,
        updatedLoginLink,
      });

      return res.status(401).json({
        message: `Your login link has been suspended. Please try again later.`,
      });
    }

    // Lock account if already suspended
    if (latestLoginLink.linkStatus === "SUSPENDED") {
      return res.status(401).json({
        message: `Your login link has been suspended. Please try again later or email support@plutomi.com`,
      });
    }

    if (latestLoginLink.expiresAt <= getCurrentTime("iso")) {
      return res.status(401).json({
        message: `Your login link has expired.`,
      });
    }

    const user = await GetUserById(userId);

    if (user && latestLoginLink) {
      // TODO should this be a transaction?
      // Simple timestamp when the user actually logged in
      CreateLoginEvent(userId);

      // Invalidates the last login link while allowing the user to login again if needed
      DeleteLoginLink(userId, latestLoginLink.created_at);

      const cleanUser = CleanUser(user as DynamoUser);

      req.session.set("user", cleanUser);
      await req.session.save();

      // If a user has invites, redirect them to that page automatically
      if (cleanUser.totalInvites > 0) {
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
