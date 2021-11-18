import Time from "../../../utils/time";
import InputValidation from "../../../utils/inputValidation";
import { NextApiRequest, NextApiResponse } from "next";
import createLoginLink from "../../../utils/loginLinks/createLoginLink";
import { nanoid } from "nanoid";
import { withSessionRoute } from "../../../middleware/withSession";
import { createHash } from "crypto";
import { getLatestLoginLink } from "../../../utils/loginLinks/getLatestLoginLink";
import { createUser } from "../../../utils/users/createUser";
import createLoginEvent from "../../../utils/users/createLoginEvent";
import deleteLoginLink from "../../../utils/loginLinks/deleteLoginLink";
import { getUserById } from "../../../utils/users/getUserById";
import updateLoginLink from "../../../utils/loginLinks/updateLoginLink";
import {
  TIME_UNITS,
  API_METHODS,
  EMAILS,
  ENTITY_TYPES,
  PLACEHOLDERS,
} from "../../../defaults";
import withValidMethod from "../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../types/main";
import sendEmail from "../../../utils/sendEmail";
import clean from "../../../utils/clean";
import { getAllOrgInvites } from "../../../utils/invites/getAllOrgInvites";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { body, method, query } = req; // TODO get from body
  const { email, loginMethod } = body;
  const { userId, key, callbackUrl } = query as Pick<
    CUSTOM_QUERY,
    "callbackUrl" | "userId" | "key"
  >;
  const loginLinkLength = 1500;
  const loginLinkMaxDelayMinutes = 10;
  const timeThreshold = Time.pastISO(
    loginLinkMaxDelayMinutes,
    TIME_UNITS.MINUTES
  );

  // Creates a login link
  if (method === API_METHODS.POST) {
    try {
      InputValidation({ email });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: `${error.message}` });
    }
    // Creates a user, returns it if already created
    const user = await createUser({ email });

    try {
      const latestLink = await getLatestLoginLink(user.userId);

      // Limit the amount of links sent in a certain period of time
      if (
        latestLink &&
        latestLink.createdAt >= timeThreshold &&
        !user.email.endsWith("@plutomi.com")
      ) {
        return res.status(400).json({
          message: "You're doing that too much, please try again later",
        });
      }

      const secret = nanoid(loginLinkLength);
      const hash = createHash("sha512").update(secret).digest("hex");

      const loginLinkExpiry = Time.futureISO(15, TIME_UNITS.MINUTES);

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
          await sendEmail({
            fromName: "Plutomi",
            fromAddress: EMAILS.GENERAL,
            toAddresses: [user.email],
            subject: `Your magic login link is here!`,
            html: `<h1><a href="${loginLink}" noreferrer target="_blank" >Click this link to log in</a></h1><p>It will expire ${Time.relative(
              new Date(loginLinkExpiry)
            )}. <strong>DO NOT SHARE THIS LINK WITH ANYONE!!!</strong></p><p>If you did not request this link, you can safely ignore it.</p>`,
          });
          return res
            .status(201)
            .json({ message: `We've sent a magic login link to your email!` });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: `${error}` }); // TODO error #
        }
      } catch (error) {
        console.error(error);
        // TODO error #
        return res.status(500).json({ message: `${error}` });
      }
    } catch (error) {
      console.error("Error getting login link", error);
      return res.status(500).json({
        // TODO error #
        message: "An error ocurred getting your info, please try again",
      });
    }
  }

  // Validates the login link when clicked
  if (method === API_METHODS.GET) {
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
        // TODO make this an error
        message: `Your login link has been suspended. Please try again later.`,
      });
    }

    // Lock account if already suspended
    if (latestLoginLink.linkStatus === "SUSPENDED") {
      return res.status(401).json({
        // TODO make this an error
        message: `Your login link has been suspended. Please try again later or email support@plutomi.com`,
      });
    }

    if (latestLoginLink.expiresAt <= Time.currentISO()) {
      return res.status(401).json({
        message: `Your login link has expired.`, // TODO make this an error
      });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res
        .status(401)
        .json({ message: "User does not exist, please login again" });
    }

    if (user && latestLoginLink) {
      // TODO should this be a transaction?
      // Simple timestamp when the user actually logged in
      createLoginEvent(userId); // TODO move this to the org events

      // Invalidates the last login link while allowing the user to login again if needed
      deleteLoginLink(userId, latestLoginLink.createdAt);

      const cleanedUser = clean(user, ENTITY_TYPES.USER);
      req.session.user = cleanedUser;
      
      /**
       * Get the user's org invites, if any, if they're not in an org.
       * The logic here being, if a user is in an org, what are the chances they're going to join another?
       *  TODO maybe revisit this?
       */
      let userInvites = []; // TODO types array of org invite
      if (req.session.user.orgId === PLACEHOLDERS.NO_ORG) {
        userInvites = await getAllOrgInvites(req.session.user.userId);
      }
      req.session.user.totalInvites = userInvites.length;
      await req.session.save();

      // If a user has invites, redirect them to the invites page on login
      if (req.session.user.totalInvites > 0) {
        res.redirect(`${process.env.NEXT_PUBLIC_WEBSITE_URL}/invites`);
        return;
      }

      res.redirect(callbackUrl);
      return;
    }
  }
};

export default withValidMethod(withSessionRoute(handler), [
  // NO AUTH as this will block all requests without a session.. and uhh.. we're creating sessions here
  API_METHODS.POST,
  API_METHODS.GET,
]);
