import { Request, Response } from 'express';
import emailValidator from 'deep-email-validator';
import * as crypto from 'crypto';
import Joi from 'joi';
import { Filter } from 'mongodb';
import { nanoid } from 'nanoid';
import {
  Defaults,
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
import { env } from '../../env';
import dayjs from 'dayjs';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { collections } from '../../utils/connectToDatabase';
import { UserEntity } from '../../models';
import { UserLoginLinkEntity } from '../../models';
import { IndexableProperties } from '../../@types/indexableProperties';
import { sendEmail } from '../../utils/sendEmail';

// TODO add types
// https://www.npmjs.com/package/@types/jsonwebtoken
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

  const { email } = req.body;

  console.log(`Incoming email`, email);
  const { callbackUrl }: APIRequestLoginLinkQuery = req.query;

  // const emailValidation = await emailValidator({
  //   email,
  //   validateSMTP: false, // TODO BUG, this isnt working
  // });

  // if (!emailValidation.valid) {
  //   return res.status(400).json({
  //     message: ERRORS.EMAIL_VALIDATION,
  //   });
  // }

  // If a user is signing in for the first time, create an account for them
  let user: UserEntity | undefined;

  console.log(`Attempting to find user with email`, email);

  try {
    user = (await collections.users.findOne({
      target: { property: IndexableProperties.Email, value: email },
    } as Filter<UserEntity>)) as UserEntity;
  } catch (error) {
    const msg = `Error retrieving user info`;
    console.error(msg, error);
    return res.status(500).json({
      message: msg,
      error,
    });
  }

  if (!user) {
    console.log('User not found');
    try {
      console.log(`Creating new user`);

      const now = new Date();
      const customId = nanoid(50);
      const newUser: UserEntity = {
        createdAt: now,
        updatedAt: now,
        totalInvites: 0,
        firstName: Defaults.FirstName,
        lastName: Defaults.LastName,
        emailVerified: false,
        canReceiveEmails: true,
        target: [
          { property: IndexableProperties.Org, value: undefined },
          { property: IndexableProperties.Email, value: email },
          { property: IndexableProperties.Id, value: customId },
        ],
      };

      console.log(`Creating new user`, newUser);

      await collections.users.insertOne(newUser);
      console.log(`User created!`);
      user = newUser;
    } catch (error) {
      const errMsg = `An error ocurred creating your account`;
      console.error(errMsg, error);
      return res.status(500).json({ message: errMsg, error });
    }
  }

  const userEmail = findInTargetArray(IndexableProperties.Email, user);
  console.log(`User created, finding in target array`, userEmail);
  // TODO add a test for this @jest
  if (!user.canReceiveEmails) {
    return res.status(403).json({
      message: `'${email}' is unable to receive emails, please reach out to support@plutomi.com to opt back in!`,
    });
  }

  let latestLoginLink: UserLoginLinkEntity;

  console.log(`Getting latest login link`);

  const loginLinkFilter: Filter<UserLoginLinkEntity> = {
    target: {
      property: IndexableProperties.User,
      value: findInTargetArray(IndexableProperties.Id, user),
    },
  };
  console.log('Filter', loginLinkFilter);
  try {
    const latestLinkArray = await collections.loginLinks
      .find(loginLinkFilter, {
        sort: {
          createdAt: -1,
        },
        limit: 1,
      })
      .toArray();

    latestLoginLink = latestLinkArray[0] as UserLoginLinkEntity;
    console.log(`got latest login link it`, latestLoginLink);
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
    amount: 10,
    unit: TIME_UNITS.MINUTES,
  };
  const now = new Date();

  const nowAsUnix = Time.currentUNIX();
  // TODO should match what is on the entity
  const ttlExpiry = Time.futureUNIX(validFor); // when the link expires and is deleted from Dynamo
  const relativeExpiry = Time.relative(Time.futureISO(validFor));

  console.log(`Creating a login link with THIS user`, user);
  let token: string;
  // TODO types

  let loginLinkUrl: string;
  let loginLink: UserLoginLinkEntity | undefined;
  const userId = findInTargetArray(IndexableProperties.Id, user);

  try {
    const newLoginLink: UserLoginLinkEntity = {
      createdAt: now,
      updatedAt: now,
      target: [
        {
          property: IndexableProperties.User,
          value: userId,
        },
      ],
    };
    await collections.loginLinks.insertOne(newLoginLink);

    console.log(`NEWLY CREATED LOGIN LINK`, newLoginLink);
    loginLink = newLoginLink;

    // TODO types
    const tokenData = {
      userId: userId,
      loginLinkId: newLoginLink._id,
    };

    console.log(`TOKIEN DATA WHEN CREATING IT`, tokenData);
    token = await jwt.sign(tokenData, env.loginLinksPassword, { expiresIn: ttlExpiry - nowAsUnix });

    // TODO enums
    loginLinkUrl = `${API_URL}/auth/login?token=${token}&callbackUrl=${
      callbackUrl || `${WEBSITE_URL}/${Defaults.Redirect}`
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
