import { Request, Response } from 'express';
import emailValidator from 'deep-email-validator';
import Joi from 'joi';
import { nanoid } from 'nanoid';
import {
  DEFAULTS,
  TIME_UNITS,
  JOI_SETTINGS,
  WEBSITE_URL,
  ERRORS,
  API_URL,
  DOMAIN_NAME,
  Emails,
} from '../../Config';
import * as Time from '../../utils/time';
import * as CreateError from '../../utils/createError';
import { DB } from '../../models';
import { sendEmail } from '../../models/Emails/sendEmail';

const jwt = require('jsonwebtoken');

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
    callbackUrl: Joi.string().uri(),
  },
}).options(JOI_SETTINGS);
export const requestLoginLink = async (req: Request, res: Response) => {
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
      message: ERRORS.EMAIL_VALIDATION,
    });
  }

  // If a user is signing in for the first time, create an account for them
  // eslint-disable-next-line prefer-const
  let [user, userError] = await DB.Users.getUserByEmail({ email });
  if (userError) {
    console.error(userError);
    const { status, body } = CreateError.SDK(userError, 'An error ocurred getting your user info');
    return res.status(status).json(body);
  }

  if (!user) {
    const [createdUser, createUserError] = await DB.Users.createUser({
      email,
    });
    if (createUserError) {
      const { status, body } = CreateError.SDK(
        createUserError,
        'An error ocurred creating your account',
      );

      return res.status(status).json(body);
    }
    user = createdUser;
  }

  // TODO add a test for this @jest
  if (!user.canReceiveEmails) {
    return res.status(403).json({
      message: `'${user.email}' is unable to receive emails, please reach out to support@plutomi.com to opt back in!`,
    });
  }

  // Check if a user is  making too many requests for a login link by comparing the time of their last link
  const [latestLink, loginLinkError] = await DB.Users.getLatestLoginLink({
    userId: user.userId,
  });

  if (loginLinkError) {
    const { status, body } = CreateError.SDK(
      loginLinkError,
      'An error ocurred getting your login link',
    );

    return res.status(status).json(body);
  }
  const timeThreshold = Time.pastISO({
    amount: 10,
    unit: TIME_UNITS.MINUTES,
  });

  if (
    latestLink &&
    latestLink.createdAt >= timeThreshold &&
    !user.email.endsWith(DOMAIN_NAME) // Allow admins to send multiple login links in a short timespan
  ) {
    return res.status(403).json({ message: "You're doing that too much, please try again later" });
  }

  const validFor: Time.ChangingTimeProps = {
    amount: 15,
    unit: TIME_UNITS.MINUTES,
  };
  const now = Time.currentUNIX();
  const ttlExpiry = Time.futureUNIX(validFor); // when the link expires and is deleted from Dynamo
  const relativeExpiry = Time.relative(Time.futureISO(validFor));

  const loginLinkId = nanoid();
  const token = await jwt.sign(
    {
      userId: user.userId,
      loginLinkId,
    },
    process.env.LOGIN_LINKS_PASSWORD,
    { expiresIn: ttlExpiry - now },
  );

  // TODO enums
  const loginLinkUrl = `${API_URL}/auth/login?token=${token}&callbackUrl=${
    callbackUrl || `${WEBSITE_URL}/${DEFAULTS.REDIRECT}`
  }`;

  const [success, creationError] = await DB.Users.createLoginLink({
    user,
    loginLinkId,
    ttlExpiry,
  });

  if (creationError) {
    const { status, body } = CreateError.SDK(
      creationError,
      'An error ocurred creating your login link',
    );

    return res.status(status).json(body);
  }

  try {
    await sendEmail({
      to: user.email,
      from: {
        header: 'Plutomi',
        email: Emails.LOGIN,
      },
      subject: `Your magic login link is here!`,
      body: `<h1>Click <a href="${loginLinkUrl}" noreferrer target="_blank" >this link</a> to log in!</h1><p>It will expire ${relativeExpiry} so you better hurry.</p><p>If you did not request this link you can safely ignore it.</p>`,
    });
  } catch (error) {
    // TODO delete login link and prompt the user to try again
    const { status, body } = CreateError.SDK(
      creationError,
      'An error ocurred sending your email :(',
    );
    return res.status(status).json(body);
  }
  return res.status(201).json({ message: `We've sent a magic login link to your email!` });
};
