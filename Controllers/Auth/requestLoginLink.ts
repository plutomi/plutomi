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
import { IUser, User } from '../../entities/User';
import { LoginLink } from '../../entities/LoginLink';
import dayjs from 'dayjs';

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

  let existingUser: IUser | undefined;

  try {
    // TODO add custom query to lowercase and trim emails
    const foundUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    console.log('Found user? ', foundUser);

    if (foundUser) {
      existingUser = foundUser;
    }
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred checking if that user exists' });
  }

  // If a user does not exist, we should create them in the database
  if (!existingUser) {
    console.log('Existing user not found.. creating one...');
    const newUser = new User({
      email,
    });

    try {
      console.log('Attempting to save user', newUser);
      await newUser.save();
      console.log('Saved!', newUser);
      existingUser = newUser;
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error ocurred creating your user account' });
    }
  }

  // TODO remove this and add unsubscribes
  // if (!user.canReceiveEmails) {
  //   return res.status(403).json({
  //     message: `'${user.email}' is unable to receive emails, please reach out to support@plutomi.com to opt back in!`,
  //   });
  // }

  // Check if a user is  making too many requests for a login link by comparing the time of their last link

  const latestLinks = await LoginLink.find({
    user: existingUser,
  })
    .limit(1)
    .sort({ createdAt: 'desc' });

  const latestLink = latestLinks[0];

  const now = new Date();
  // If it exists
  if (latestLink && latestLink.createdAt >= dayjs(now).subtract(15, 'minutes').toDate()) {
    return res
      .status(429)
      .json({ message: "You're doing that too much, try again in a few minutes" });
  }

  // Create a login link for the user
  console.log('Creating a new login link');

  const newLink = new LoginLink({
    user: existingUser,
  });

  const savedLink = await newLink.save();

  console.log('Saved new link');

  const token = await jwt.sign(
    {
      userId: existingUser._id,
      loginLinkId: savedLink._id,
    },
    process.env.LOGIN_LINKS_PASSWORD,
    { expiresIn: '15m' },
  );

  // TODO enums
  const loginLinkUrl = `${API_URL}/auth/login?token=${token}&callbackUrl=${
    callbackUrl || `${WEBSITE_URL}/${DEFAULTS.REDIRECT}`
  }`;

  try {
    await sendEmail({
      to: existingUser.email,
      from: {
        header: 'Plutomi',
        email: Emails.LOGIN,
      },
      subject: `Your magic login link is here!`, // TODO add back relative expiry
      body: `<h1>Click <a href="${loginLinkUrl}" noreferrer target="_blank" >this link</a> to log in!</h1><p>It will expire in about 15 minutes so you better hurry.</p><p>If you did not request this link you can safely ignore it.</p>`,
    });
  } catch (error) {
    // TODO delete login link and prompt the user to try again
    const { status, body } = CreateError.SDK(error, 'An error ocurred sending your email :(');
    return res.status(status).json(body);
  }
  return res.status(201).json({ message: `We've sent a magic login link to your email!` });
};
