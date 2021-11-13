import Time from "../../../utils/time";
import InputValidation from "../../../utils/inputValidation";
import { NextApiResponse } from "next";
import sendLoginLink from "../../../utils/email/sendLoginLink";
import createLoginLink from "../../../utils/loginLinks/createLoginLink";
import { nanoid } from "nanoid";
import { withSessionRoute } from "../../../middleware/withSession";
import { createHash } from "crypto";
import { getLatestLoginLink } from "../../../utils/loginLinks/getLatestLoginLink";
import { createUser } from "../../../utils/users/createUser";
import createLoginEvent from "../../../utils/users/createLoginEvent";
import deleteLoginLink from "../../../utils/loginLinks/deleteLoginLink";
import cleanUser from "../../../utils/clean/cleanUser";
import { getUserById } from "../../../utils/users/getUserById";
import updateLoginLink from "../../../utils/loginLinks/updateLoginLink";
import { TimeUnits } from "../../../types";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const { body, method, query } = req; // TODO get from body
  const { userEmail, loginMethod } = body;
  const { userId, key, callbackUrl } = query as CustomQuery;
  const loginLinkLength = 1500;
  const loginLinkMaxDelayMinutes = 10;
  const timeThreshold = Time.pastISO(
    loginLinkMaxDelayMinutes,
    TimeUnits.MINUTES
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
    const user = await createUser({ userEmail });

    try {
      const latestLink = await getLatestLoginLink(user.userId);

      // Limit the amount of links sent in a certain period of time
      if (
        latestLink &&
        latestLink.createdAt >= timeThreshold &&
        !user.userEmail.endsWith("@plutomi.com")
      ) {
        return res.status(400).json({
          message: "You're doing that too much, please try again later",
        });
      }

      const secret = nanoid(loginLinkLength);
      const hash = createHash("sha512").update(secret).digest("hex");

      const loginLinkExpiry = Time.futureISO(15, TimeUnits.MINUTES);

      try {
        await createLoginLink({
          user: user,
          loginLinkHash: hash,
          loginLinkExpiry: loginLinkExpiry,
        });
        const defaultRedirect = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/dashboard`;
        const loginLink = `${
          process.env.NEXT_PUBLIC_WEBSITE_URL
        }/api/auth/login?userId=${user.userId}&key=${secret}&callbackUrl=${
          callbackUrl ? callbackUrl : defaultRedirect
        }`;

        if (loginMethod === "GOOGLE") {
          return res.status(200).json({ message: loginLink });
        }
        try {
          await sendLoginLink({
            recipientEmail: user.userEmail,
            loginLink: loginLink,
            loginLinkRelativeExpiry: getRelativeTime(loginLinkExpiry),
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
    const validateLoginLinkInput = {
      userId: userId,
      key: key,
    };
    try {
      InputValidation(validateLoginLinkInput);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

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

      await updateLoginLink({
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

    if (latestLoginLink.expiresAt <= Time.currentISO()) {
      return res.status(401).json({
        message: `Your login link has expired.`,
      });
    }

    const user = await getUserById(userId);

    if (user && latestLoginLink) {
      // TODO should this be a transaction?
      // Simple timestamp when the user actually logged in
      createLoginEvent(userId);

      // Invalidates the last login link while allowing the user to login again if needed
      deleteLoginLink(userId, latestLoginLink.createdAt);

      const cleanUser = cleanUser(user as DynamoUser);

      req.session.user = cleanUser;
      await req.session.save();

      // If a user has invites, redirect them to that page automatically
      if (cleanUser.totalInvites > 0) {
        res.redirect(`${process.env.NEXT_PUBLIC_WEBSITE_URL}/invites`);
        return;
      }

      res.redirect(callbackUrl);
      return;
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionRoute(handler);
