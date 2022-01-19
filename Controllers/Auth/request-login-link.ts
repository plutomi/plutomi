import { Request, Response } from "express";
import emailValidator from "deep-email-validator";
import Joi from "joi";

import {
  DEFAULTS,
  LOGIN_LINK_SETTINGS,
  TIME_UNITS,
  JOI_SETTINGS,
  WEBSITE_URL,
} from "../../Config";
import * as Time from "../../utils/time";
import * as Users from "../../models/Users";
import { nanoid } from "nanoid";
import { sealData } from "iron-session";
import { API_URL, DOMAIN_NAME } from "../../Config";
import * as CreateError from "../../utils/errorGenerator";
interface APIRequestLoginLinkBody {
  email?: string;
}
interface APIRequestLoginLinkQuery {
  callbackUrl?: string;
}

const schema = Joi.object({
  body: {
    email: Joi.string().email(),
  },
  query: {
    callbackUrl: Joi.string().uri().optional(),
  },
}).options(JOI_SETTINGS);
const requestLoginLink = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { email }: APIRequestLoginLinkBody = req.body;
  const { callbackUrl }: APIRequestLoginLinkQuery = req.query;

  const emailValidation = await emailValidator({
    email,
    validateSMTP: false, // TODO BUG, this isnt working
  });

  if (!emailValidation.valid) {
    return res.status(400).json({
      message: "Hmm... that email doesn't seem quite right. Check it again.",
    });
  }

  // If a user is signing in for the first time, create an account for them
  let [user, userError] = await Users.getUserByEmail({ email });
  if (userError) {
    console.error(userError);
    const { status, body } = CreateError.SDK(
      userError,
      "An error ocurred getting your user info"
    );
    return res.status(status).json(body);
  }

  if (!user) {
    const [createdUser, createUserError] = await Users.createUser({
      email,
    });
    if (createUserError) {
      const { status, body } = CreateError.SDK(
        createUserError,
        "An error ocurred creating your account"
      );

      return res.status(status).json(body);
    }
    user = createdUser;
  }

  // TODO move this to comms machine? This would be for login links and its pretty crucial to know if I unsubscribed
  // TODO add a test for this @jest
  if (!user.canReceiveEmails) {
    return res.status(403).json({
      message: `'${user.email}' is unable to receive emails, please reach out to support@plutomi.com to opt back in!`,
    });
  }

  // Check if a user is  making too many requests for a login link by comparing the time of their last link
  const [latestLink, loginLinkError] = await Users.getLatestLoginLink({
    userId: user.userId,
  });

  if (loginLinkError) {
    const { status, body } = CreateError.SDK(
      loginLinkError,
      "An error ocurred getting your login link"
    );

    return res.status(status).json(body);
  }
  const timeThreshold = Time.pastISO(10, TIME_UNITS.MINUTES);
  if (
    latestLink &&
    latestLink.createdAt >= timeThreshold &&
    !user.email.endsWith(DOMAIN_NAME) // Allow admins to send multiple login links in a short timespan
  ) {
    return res
      .status(403)
      .json({ message: "You're doing that too much, please try again later" });
  }

  // Create a login link for them
  const loginLinkId = nanoid();
  const loginLinkExpiry = Time.futureISO(15, TIME_UNITS.MINUTES); // when the link expires

  // TODO replace this with iron seal directly
  const seal = await sealData(
    {
      userId: user.userId,
      loginLinkId,
    },
    LOGIN_LINK_SETTINGS
  );

  const loginLinkUrl = `${API_URL}/login?seal=${seal}&callbackUrl=${
    callbackUrl ? callbackUrl : `${WEBSITE_URL}/${DEFAULTS.REDIRECT}`
  }`;
  /**
   * Email will be sent asynchronously
   */
  const [success, creationError] = await Users.createLoginLink({
    loginLinkId,
    loginLinkUrl,
    loginLinkExpiry,
    user,
  });

  if (creationError) {
    const { status, body } = CreateError.SDK(
      creationError,
      "An error ocurred creating your login link"
    );

    return res.status(status).json(body);
  }

  return res
    .status(201)
    .json({ message: `We've sent a magic login link to your email!` });
};

export default requestLoginLink;
