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
import { IndexedEntities } from '../../types/main';
import { findInTargetArray } from '../../utils/findInTargetArray';

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
  console.log(`Attempting to find user with email`, email);
  try {
    user = await req.entityManager.findOne(User, {
      target: { id: email, type: IndexedEntities.Email },
    });
  } catch (error) {
    console.error(`Error retrieving user info`, error);
    return res.status(500).json({
      message: `Error retrieving user info`,
      error,
    });
  }

  if (!user) {
    try {
      console.log(`Creating new user`);
      const createdUser = new User({
        firstName: DEFAULTS.FIRST_NAME,
        lastName: DEFAULTS.LAST_NAME,
        target: [
          {
            id: email,
            type: IndexedEntities.Email,
          },
        ],
      });
      console.log(`Creating new user`, createdUser);

      await req.entityManager.persistAndFlush(createdUser);
      console.log(`User created`);
      user = createdUser;
    } catch (error) {
      console.error(`An error ocurred creating your account`, error);
      return res.status(500).json({ message: 'An error ocurred creating your account', error });
    }
  }

  const userEmail = findInTargetArray({ entity: IndexedEntities.Email, targetArray: user.target });
  console.log(`User created, finding in target array`, userEmail);
  // TODO add a test for this @jest
  if (!user.canReceiveEmails) {
    return res.status(403).json({
      message: `'${email}' is unable to receive emails, please reach out to support@plutomi.com to opt back in!`,
    });
  }

  let latestLoginLink: UserLoginLink;

  console.log(`Getting latest lgin link`);
  try {
    latestLoginLink = await req.entityManager.findOne(
      // TODO idnex lookup
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

  console.log(`Creating a login link with THIS user`, user);
  console.log(`USER ID`, user.id);
  let token: string;
  // TODO types

  let loginLinkUrl: string;

  try {
    const newLoginLink = new UserLoginLink({
      user,
    });
    await req.entityManager.persistAndFlush(newLoginLink);

    console.log(`NEWLY CREATEDED LOGIN LINK`, newLoginLink);

    const tokenData = {
      userId: user.id,
      loginLinkId: newLoginLink._id, // TODO Using regular .id here returns undefined????     // Cannot use .id as it returns undefined after creating a new entity possible mikro-orm bug
    };

    console.log(`TOKIEN DATA WHEN CREATING IT`, tokenData);
    token = await jwt.sign(tokenData, env.loginLinksPassword, { expiresIn: ttlExpiry - now });

    // TODO enums
    loginLinkUrl = `${API_URL}/auth/login?token=${token}&callbackUrl=${
      callbackUrl || `${WEBSITE_URL}/${DEFAULTS.REDIRECT}`
    }`;
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
