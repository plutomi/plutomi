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
import * as Users from "../models/Users/index";
import { LOGIN_LINK_SETTINGS } from "../Config";
import errorFormatter from "../utils/errorFormatter";
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

  const [user, error] = await Users.getUserById({ userId }); // TODO async error handling

  if (error) {
    const formattedError = errorFormatter(error);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred getting your user info",
      ...formattedError,
    });
  }
  if (!user) {
    return res
      .status(401) // I dont know in what situation this would happen as the seal needs a userId on creation
      .json({ message: "Invalid userId, please login again" });
  }

  const userOrg = user.orgId !== DEFAULTS.NO_ORG ?? user.orgId;
  const [success, failed] = await Users.createLoginEventAndDeleteLoginLink({
    loginLinkId,
    userId,
    orgId: userOrg,
  });

  if (failed) {
    const formattedError = errorFormatter(failed);
    return res.status(formattedError.httpStatusCode).json({
      message: "Unable to create login event",
      ...formattedError,
    });
  }

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
    res.redirect(`${process.env.WEBSITE_URL}/invites`);
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
    loginMethod: Joi.string().valid(LOGIN_METHODS.GOOGLE, LOGIN_METHODS.EMAIL),
  }).options({ presence: "required" });

  // Validate input
  try {
    await schema.validateAsync(createLoginLinkInput);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  let [user, userError] = await Users.getUserByEmail({ email });
  if (userError) {
    const formattedError = errorFormatter(userError);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred getting your user info",
      ...formattedError,
    });
  }

  // If a user is signing in for the first time, create an account for them
  if (!user) {
    const [createdUser, createUserError] = await Users.createUser({ email });

    if (createUserError) {
      const formattedError = errorFormatter(createUserError);
      return res.status(formattedError.httpStatusCode).json({
        message: "An error ocurred creating your account",
        ...formattedError,
      });
    }

    user = createdUser;
  }

  if (!user.canReceiveEmails && loginMethod === LOGIN_METHODS.EMAIL) {
    return res.status(403).json({
      message: `${user.email} is unable to receive emails, please reach out to support@plutomi.com to opt back in!`,
    });
  }

  const [latestLink, loginLinkError] = await Users.getLatestLoginLink({
    userId: user.userId,
  });

  if (loginLinkError) {
    const formattedError = errorFormatter(loginLinkError);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred getting your login link",
      ...formattedError,
    });
  }

  // Limit the amount of links sent in a certain period of time
  const timeThreshold = Time.pastISO(10, TIME_UNITS.MINUTES);

  if (
    latestLink &&
    latestLink.createdAt >= timeThreshold &&
    !user.email.endsWith(process.env.DOMAIN_NAME) // Allow admins to send multiple login links in a short timespan
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
    LOGIN_LINK_SETTINGS
  );

  const loginLinkUrl = `${
    process.env.API_URL
  }/auth/login?seal=${seal}&callbackUrl=${
    callbackUrl ? callbackUrl : process.env.DOMAIN_NAME + DEFAULTS.REDIRECT
  }`;

  /**
   * Email will be sent by queue handler downstream
   */
  const [success, creationError] = await Users.createLoginLink({
    loginLinkId,
    loginMethod,
    loginLinkUrl,
    userId: user.userId,
    email: user.email,
    loginLinkExpiry,
    unsubscribeHash: user.unsubscribeHash,
  });

  if (creationError) {
    const formattedError = errorFormatter(creationError);
    return res.status(formattedError.httpStatusCode).json({
      message: "An error ocurred creating your login link",
      ...formattedError,
    });
  }

  if (loginMethod === LOGIN_METHODS.GOOGLE) {
    // Cannot do serverside redirect from axios post
    return res.status(200).json({ message: loginLinkUrl });
  }

  return res
    .status(201)
    .json({ message: `We've sent a magic login link to your email!` });
};

export const logout = async (req: Request, res: Response) => {
  req.session.destroy();
  return res.status(200).json({ message: "You've been logged out" });
};
