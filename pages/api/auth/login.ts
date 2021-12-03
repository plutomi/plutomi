import Time from "../../../utils/time";
import { NextApiRequest, NextApiResponse } from "next";
import createLoginLink from "../../../utils/loginLinks/createLoginLink";
import { nanoid } from "nanoid";
import { withSessionRoute } from "../../../middleware/withSession";
import { sealData, unsealData } from "iron-session";
import { getLatestLoginLink } from "../../../utils/loginLinks/getLatestLoginLink";
import { createUser } from "../../../utils/users/createUser";
import { getUserById } from "../../../utils/users/getUserById";
import Sanitize from "../../../utils/sanitize";
import {
  TIME_UNITS,
  API_METHODS,
  EMAILS,
  ENTITY_TYPES,
  DEFAULTS,
  LOGIN_METHODS,
} from "../../../Config";
import withValidMethod from "../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../types/main";
import sendEmail from "../../../utils/sendEmail";
import { getOrgInvitesForUser } from "../../../utils/invites/getOrgInvitesForUser";
import { createLoginEventAndDeleteLoginLink } from "../../../utils/loginLinks/createLoginEventAndDeleteLoginLink";
import Joi from "joi";

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
  const { seal, callbackUrl } = query as Pick<
    CUSTOM_QUERY,
    "callbackUrl" | "userId" | "seal"
  >;

  // Creates a login link
  if (method === API_METHODS.POST) {
    const createLoginLinkInput = {
      // TODO create type
      email: email,
      loginMethod: loginMethod,
    };

    const schema = Joi.object({
      email: Joi.string().email(),
      loginMethod: Joi.string().valid(LOGIN_METHODS.GOOGLE, LOGIN_METHODS.LINK),
    }).options({ presence: "required" });

    // Validate input
    try {
      await schema.validateAsync(createLoginLinkInput);
    } catch (error) {
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
        !user.email.endsWith("@plutomi.com") // todo contact enum or domain name
      ) {
        return res.status(400).json({
          message: "You're doing that too much, please try again later", // TODO enum
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

        if (loginMethod === LOGIN_METHODS.GOOGLE) {
          // Cannot do serverside redirect from axios post
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
        .status(401) // I dont know in what situation this would happen, but just in case.. we need the user's orgId anyway
        .json({ message: "Invalid userId, please login again" });
    }

    const userOrg = user.orgId !== DEFAULTS.NO_ORG ?? user.orgId;
    await createLoginEventAndDeleteLoginLink({
      loginLinkId,
      userId,
      orgId: userOrg,
    });

    const cleanedUser = Sanitize.clean(user, ENTITY_TYPES.USER);
    req.session.user = cleanedUser;

    /**
     * Get the user's org invites, if any, if they're not in an org.
     * The logic here being, if a user is in an org, what are the chances they're going to join another?
     *  TODO maybe revisit this?
     */
    let userInvites = []; // TODO types array of org invite
    if (req.session.user.orgId === DEFAULTS.NO_ORG) {
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

    res.redirect(307, callbackUrl);
    return;
  }
};

export default withValidMethod(withSessionRoute(handler), [
  // NO AUTH as this will block all requests without a session.. and uhh.. we're creating sessions here
  API_METHODS.POST,
  API_METHODS.GET,
]);
