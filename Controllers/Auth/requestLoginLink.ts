import { Request, Response } from 'express';
import emailValidator from 'deep-email-validator';
import * as crypto from 'crypto';
import Joi from 'joi';
import { Filter, FindOptions } from 'mongodb';
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
import { env } from '../../env';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { collections } from '../../utils/connectToDatabase';
import { UserEntity } from '../../models';
import { UserLoginLinkEntity } from '../../models';
import { IndexableProperties } from '../../@types/indexableProperties';
import { sendEmail } from '../../utils/sendEmail';
import { generateId } from '../../utils';
import { Time } from '../../utils';

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
    return res.status(400).json({ message: 'An error ocurred', error });
  }

  const { email } = req.body;

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
      const newUserId = generateId({});
      const newUser: UserEntity = {
        id: newUserId,
        orgId: null,
        createdAt: now,
        updatedAt: now,
        totalInvites: 0,
        firstName: null,
        lastName: null,
        emailVerified: false,
        canReceiveEmails: true,
        target: [
          { property: IndexableProperties.CustomId, value: newUserId },
          { property: IndexableProperties.Org, value: null },
          { property: IndexableProperties.Email, value: email },
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
  // TODO add a test for this @jest
  if (!user.canReceiveEmails) {
    return res.status(403).json({
      message: `'${email}' is unable to receive emails, please reach out to support@plutomi.com to opt back in!`,
    });
  }

  let latestLoginLink: UserLoginLinkEntity;

  const loginLinkFilter: Filter<UserLoginLinkEntity> = {
    target: {
      property: IndexableProperties.User,
      value: user.id,
    },
  };

  const loginLinkFindOptions: FindOptions<UserLoginLinkEntity> = {
    sort: {
      createdAt: -1,
    },
    limit: 1,
  };

  try {
    const latestLinkArray = await collections.loginLinks
      .find(loginLinkFilter, loginLinkFindOptions)
      .toArray();

    latestLoginLink = latestLinkArray[0] as UserLoginLinkEntity;
  } catch (error) {
    console.error(`An error ocurred finding your info (login links error)`);
    return res
      .status(500)
      .json({ message: 'An error ocurred finding your info (login links error)' });
  }

  const now = new Date();

  if (
    latestLoginLink &&
    latestLoginLink.createdAt >= Time(now).subtract(10, 'minutes').toDate() &&
    !userEmail.endsWith(DOMAIN_NAME) // Allow admins to send multiple login links in a short timespan
  ) {
    return res.status(403).json({ message: "You're doing that too much, please try again later" });
  }

  const linkExpiry = Time(now).add(10, 'minutes');

  /**
   * Text like 18 minutes from now
   */
  const relativeExpiry = Time(now).from(linkExpiry);

  let token: string;
  // TODO types

  let loginLinkUrl: string;
  const userId = user.id;

  try {
    const newLoginLink: UserLoginLinkEntity = {
      createdAt: now,
      updatedAt: now,
      id: generateId({ length: 100, fullAlphabet: true }),
      target: [
        {
          property: IndexableProperties.User,
          value: userId,
        },
      ],
    };
    await collections.loginLinks.insertOne(newLoginLink);

    // TODO types
    const tokenData = {
      userId,
      loginLinkId: newLoginLink.id,
    };

    token = await jwt.sign(tokenData, env.loginLinksPassword, {
      expiresIn: Time().add(10, 'minutes').unix() - Time().unix(),
    });

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
        email: Emails.Login,
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
