import Time from "../../../utils/time";
import InputValidation from "../../../utils/inputValidation";
import { NextApiRequest, NextApiResponse } from "next";
import createLoginLink from "../../../utils/loginLinks/createLoginLink";
import { nanoid } from "nanoid";
import { withSessionRoute } from "../../../middleware/withSession";
import { createHash } from "crypto";
import { sealData, unsealData } from "iron-session";
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
  LOGIN_LINK_STATUS,
} from "../../../defaults";
import withValidMethod from "../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../types/main";
import sendEmail from "../../../utils/sendEmail";
import clean from "../../../utils/clean";
import { getOrgInvitesForUser } from "../../../utils/invites/getOrgInvitesForUser";

const ironPassword = process.env.IRON_SEAL_PASSWORD;

const ironOptions = {
  password: ironPassword,
  ttl: 60 * 15, // Seal will be valid for 15 minutes // TODO test seal
};
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { body, method, query } = req; // TODO get from body
  const { email, loginMethod } = body;
  const { userId, seal, callbackUrl } = query as Pick<
    CUSTOM_QUERY,
    "callbackUrl" | "userId" | "seal"
  >;

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
      const latestLink = await getLatestLoginLink({
        userId: user.userId,
      });

      // Limit the amount of links sent in a certain period of time
      const timeThreshold = Time.pastISO(10, TIME_UNITS.MINUTES);
      if (
        latestLink &&
        latestLink.createdAt >= timeThreshold &&
        !user.email.endsWith("@plutomi.com") // todo contact enum
      ) {
        return res.status(400).json({
          message: "You're doing that too much, please try again later",
        });
      }

      const loginLinkId = nanoid(100);
      const loginLinkExpiry = Time.futureISO(15, TIME_UNITS.MINUTES); // when the link expires

      const seal = await sealData(
        {
          userId: user.userId,
          loginLinkId: loginLinkId,
        },
        ironOptions
      );

      try {
        await createLoginLink({
          userId: user.userId,
          loginLinkId,
        });

        const defaultRedirect = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/dashboard`;
        const loginLink = `${
          process.env.NEXT_PUBLIC_WEBSITE_URL
        }/api/auth/login?seal=${seal}&callbackUrl=${
          callbackUrl ? callbackUrl : defaultRedirect
        }`;

        if (loginMethod === "GOOGLE") {
          // TODO redirect the user direcly here!!!
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
            .status(201) // todo switch to 200?
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
    const { userId, loginLinkId }: { userId: string; loginLinkId: string } =
      await unsealData(
        // TODO types, // TODO try catch
        seal,
        ironOptions
      );
    if (!userId || !loginLinkId) {
      // Time expired
      return res.status(401).json({ message: "Your link is invalid" });
    }

    const user = await getUserById({ userId });

    if (!user) {
      return res
        .status(401) // I dont know in what situation this would happen, but just in case
        .json({ message: "Invalid userId, please login again" });
    }

    // TODO should this be a transaction?
    // Simple timestamp when the user actually logged in
    createLoginEvent({ userId }); // TODO move this to the org events

    // Invalidates the last login link while allowing the user to login again if needed
    deleteLoginLink({
      userId: userId,
      loginLinkTimestmap: latestLoginLink.createdAt,
    });

    const cleanedUser = clean(user, ENTITY_TYPES.USER);
    req.session.user = cleanedUser;

    /**
     * Get the user's org invites, if any, if they're not in an org.
     * The logic here being, if a user is in an org, what are the chances they're going to join another?
     *  TODO maybe revisit this?
     */
    let userInvites = []; // TODO types array of org invite
    if (req.session.user.orgId === PLACEHOLDERS.NO_ORG) {
      userInvites = await getOrgInvitesForUser({
        userId: req.session.user.userId,
      });
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
};

export default withValidMethod(withSessionRoute(handler), [
  // NO AUTH as this will block all requests without a session.. and uhh.. we're creating sessions here
  API_METHODS.POST,
  API_METHODS.GET,
]);
