import { Request, Response } from "express";
import Joi from "joi";

import {
  DEFAULTS,
  LOGIN_LINK_SETTINGS,
  TIME_UNITS,
  JOI_SETTINGS,
  WEBSITE_URL,
  COOKIE_NAME,
  COOKIE_SETTINGS,
  SESSION_SETTINGS,
} from "../../Config";
import * as Time from "../../utils/time";
import * as Users from "../../models/Users";
import { nanoid } from "nanoid";
import { sealData, unsealData } from "iron-session";
import { API_URL, DOMAIN_NAME } from "../../Config";
import * as CreateError from "../../utils/errorGenerator";
import errorFormatter from "../../utils/errorFormatter";
interface APILoginQuery {
  callbackUrl?: string;
  seal?: string;
}

const schema = Joi.object({
  query: {
    callbackUrl: Joi.string().uri().optional(),
    seal: Joi.string(),
  },
}).options(JOI_SETTINGS);
const login = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }
  const { callbackUrl, seal }: APILoginQuery = req.query;

  let userId: string;
  let loginLinkId: string;

  // Validate that the login link is 1. Valid - syntax wise & 2. Has valid data
  try {
    // TODO types
    const data: { userId: string; loginLinkId: string } = await unsealData(
      seal,
      LOGIN_LINK_SETTINGS
    );

    // If the seal expired, these will be undefined. Also undefined for things like seal=123
    if (!data.userId || !data.loginLinkId) {
      return res.status(401).json({ message: "Your link is invalid" });
    }

    userId = data.userId;
    loginLinkId = data.loginLinkId;
  } catch (error) {
    return res.status(400).json({ message: "Bad seal" });
  }

  const [user, error] = await Users.getUserById({ userId });

  if (error) {
    const { status, body } = CreateError.SDK(
      error,
      "An error ocurred using your login link"
    );
    return res.status(status).json(body);
  }

  // If a user is deleted between when they made they requested the login link
  // and when they attempted to sign in... somehow
  if (!user) {
    return res.status(401).json({
      message: `Please contact support, your user account appears to be deleted.`,
    });
  }

  // If this is a new user, an asynchronous welcome email is sent through step functions
  // It triggers if the user.verifiedEmail is false
  const [success, failed] = await Users.createLoginEventAndDeleteLoginLink({
    loginLinkId,
    user,
  });

  if (failed) {
    const formattedError = errorFormatter(failed);
    // If login link has been used, it will throw this error
    const LOGIN_LINK_ALREADY_USED_ERROR = `Transaction cancelled, please refer cancellation reasons for specific reasons [None, ConditionalCheckFailed]`;
    if (formattedError.errorMessage === LOGIN_LINK_ALREADY_USED_ERROR) {
      return res.status(401).json({ message: "Login link no longer valid" });
    }
    const { status, body } = CreateError.SDK(
      error,
      "Unable to create login event"
    );

    return res.status(status).json(body);
  }

  const session = {
    userId,
    expiresAt: Time.futureISO(12, TIME_UNITS.HOURS), // TODO set in config
  };
  const encryptedCookie = await sealData(session, SESSION_SETTINGS);

  res.cookie(COOKIE_NAME, encryptedCookie, {
    httpOnly: process.env.NODE_ENV === "production",
    sameSite: "strict",
    secure: true,
  });
  res.header("Location", callbackUrl);
  // If a user has invites, redirect them to the invites page
  //  on login regardless of the callback url
  if (user.totalInvites > 0) {
    res.header("Location", `${WEBSITE_URL}/invites`);
  }

  return res.status(307).json({ message: "Login success!" });
};

export default login;
