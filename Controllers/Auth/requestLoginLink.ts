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
import { sendEmail } from '../../models/Emails/sendEmail';
import { env } from '../../env';
import { User, UserLoginLink } from '../../entities';
import { QueryOrder } from '@mikro-orm/core';
import dayjs from 'dayjs';
import { IndexedTargetArray } from '../../types/main';

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
  let user: User;
  try {
    user = await req.entityManager.findOne(User, {
      target: { $elemMatch: { id: email, type: 'email' } } as any,
    });
  } catch (error) {
    console.error(`Error retrieving user info`, error);
    return res.status(500).json({
      message: `Error retrieving user info`,
      error,
    });
  }

  if (!user) {
    let createdUser: User;

    try {
      createdUser = new User({
        firstName: DEFAULTS.FIRST_NAME,
        lastName: DEFAULTS.LAST_NAME,
        target: [
          {
            id: email,
            type: 'email',
          },
        ],
      });

      console.log(`Persisiting!!`);
      await req.entityManager.persistAndFlush(createdUser);
      console.log(`Persisted`);
      console.log(`New user after`, createdUser);
      user = createdUser;
    } catch (error) {
      console.error(`An error ocurred creating your account`);
      return res.status(500).json({ message: 'An error ocurred creating your account' });
    }
  }

  const userEmail = user.target.find((values) => values.type === 'email').id;
  console.log(`Outside of loop, user is`, user);
  // TODO add a test for this @jest
  if (!user.canReceiveEmails) {
    return res.status(403).json({
      message: `'${userEmail}' is unable to receive emails, please reach out to support@plutomi.com to opt back in!`,
    });
  }

  let latestLoginLink: UserLoginLink;

  console.log(`Getting latest lgin link`);
  try {
    latestLoginLink = await req.entityManager.findOne(
      UserLoginLink,
      {
        user,
      },
      {
        orderBy: {
          ttlExpiry: QueryOrder.DESC,
        },
      },
    );
    console.log(`got it`);
  } catch (error) {
    console.error(`An error ocurred finding your info (login links error)`);
    return res
      .status(500)
      .json({ message: 'An error ocurred finding your info (login links error)' });
  }

  if (
    latestLoginLink &&
    latestLoginLink.createdAt >= dayjs().subtract(10, 'minutes').toDate() &&
    !userEmail.endsWith(DOMAIN_NAME) // Allow admins to send multiple login links in a short timespan
  ) {
    return res.status(403).json({ message: "You're doing that too much, please try again later" });
  }

  const validFor: Time.ChangingTimeProps = {
    amount: 15,
    unit: TIME_UNITS.MINUTES,
  };
  const now = Time.currentUNIX();
  // TODO should match what is on the entity
  const ttlExpiry = Time.futureUNIX(validFor); // when the link expires and is deleted from Dynamo
  const relativeExpiry = Time.relative(Time.futureISO(validFor));

  const loginLinkId = nanoid();
  const token = await jwt.sign(
    {
      id: user.id,
      loginLinkId,
    },
    env.loginLinksPassword,
    { expiresIn: ttlExpiry - now },
  );

  // TODO enums
  const loginLinkUrl = `${API_URL}/auth/login?token=${token}&callbackUrl=${
    callbackUrl || `${WEBSITE_URL}/${DEFAULTS.REDIRECT}`
  }`;

  try {
    const newLoginLink = new UserLoginLink({
      user,
    });
    await req.entityManager.persistAndFlush(newLoginLink);
  } catch (error) {
    console.error(`An error ocurred creating your login link`);
    return res.status(500).json({ message: 'An error ocurred creating your login link' });
  }

  try {
    await sendEmail({
      to: userEmail,
      from: {
        header: 'Plutomi',
        email: Emails.LOGIN,
      },
      subject: `Your magic login link is here!`,
      body: `<h1>Click <a href="${loginLinkUrl}" noreferrer target="_blank" >this link</a> to log in!</h1><p>It will expire ${relativeExpiry} so you better hurry.</p><p>If you did not request this link you can safely ignore it.</p>`,
    });
  } catch (error) {
    console.error(`Error sending login link email`, error);
    return res.status(500).json({ message: 'Error sending login link email', error });
  }
  return res.status(201).json({ message: `We've sent a magic login link to your email!` });
};
