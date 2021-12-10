import {
  DEFAULTS,
  EMAILS,
  ENTITY_TYPES,
  LOGIN_METHODS,
  TIME_UNITS,
} from "../Config";
import { Request, Response } from "express";
import { sealData, unsealData } from "iron-session";
import { nanoid } from "nanoid";
import { CUSTOM_QUERY } from "../types/main";
import Sanitize from "../utils/sanitize";
import Joi from "joi";
import sendEmail from "../utils/sendEmail";
import * as Time from "../utils/time";
import * as Users from "../models/Users/Users";
import { LOGIN_LINK_SETTINGS } from "../Config";

export const session = async (req: Request, res: Response) => {
  return res.status(200).json({ message: req.session });
};
export const login = async (req: Request, res: Response) => {
  const { callbackUrl, seal } = req.query as Pick<
    CUSTOM_QUERY,
    "callbackUrl" | "userId" | "seal"
  >;

  if (!seal) {
    return res.status(400).json({ message: "Invalid seal" });
  }

  // Validates the login link when clicked
  const { userId, loginLinkId }: { userId: string; loginLinkId: string } =
    await unsealData(
      // TODO types, // TODO try catch
      seal,
      LOGIN_LINK_SETTINGS
    );

  // If the link expired, these will be undefined
  if (!userId || !loginLinkId) {
    return res.status(401).json({ message: "Your link is invalid" });
  }

  const user = await Users.getUserById({ userId }); // TODO async error handling

  if (!user) {
    return res
      .status(401) // I dont know in what situation this would happen, but just in case.. we need the user's orgId anyway
      .json({ message: "Invalid userId, please login again" });
  }

  const userOrg = user.orgId !== DEFAULTS.NO_ORG ?? user.orgId;
  await Users.createLoginEventAndDeleteLoginLink({
    loginLinkId,
    userId,
    orgId: userOrg,
  });

  const cleanedUser = Sanitize.clean(user, ENTITY_TYPES.USER); // TODO not working!
  req.session.user = cleanedUser;
  /**
   * Get the user's org invites, if any, if they're not in an org.
   * The logic here being, if a user is in an org, what are the chances they're going to join another?
   *  TODO maybe revisit this?
   */
  let userInvites = []; // TODO types array of org invite
  if (req.session.user.orgId === DEFAULTS.NO_ORG) {
    userInvites = await Users.getInvitesForUser({
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
};

export const createLoginLinks = async (req: Request, res: Response) => {
  const { email, loginMethod } = req.body;
  const { callbackUrl } = req.query as Pick<
    CUSTOM_QUERY,
    "callbackUrl" | "userId" | "seal"
  >;
  // Creates a login link
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

  let user = await Users.getUserByEmail({ email });
  if (!user) {
    user = await Users.createUser({ email });
  }

  try {
    const latestLink = await Users.getLatestLoginLink({
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
      LOGIN_LINK_SETTINGS
    );

    try {
      await Users.createLoginLink({
        userId: user.userId,
        loginLinkId,
      });

      const defaultRedirect = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/dashboard`;
      const loginLink = `${
        process.env.API_URL
      }/auth/login?seal=${seal}&callbackUrl=${
        callbackUrl ? callbackUrl : defaultRedirect
      }`;

      if (loginMethod === LOGIN_METHODS.GOOGLE) {
        // Cannot do serverside redirect from axios post
        return res.status(200).json({ message: loginLink });
      }

      // TODO TRY CATCH HELL LOL
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
};

export const logout = async (req: Request, res: Response) => {
  req.session.destroy();
  return res.status(200).json({ message: "You've been logged out" });
};
