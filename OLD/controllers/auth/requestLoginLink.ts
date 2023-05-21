import { Request, Response } from 'express';
import Joi from 'joi';
import { Filter, FindOptions } from 'mongodb';
import { Defaults, JOI_SETTINGS, WEBSITE_URL, API_URL, DOMAIN_NAME, Emails } from '../../Config';
import { envVars } from '../../env';
import { sendEmail } from '../../OLD/utils/sendEmail';
import { Time, generatePlutomiId } from '../../OLD/utils';
import { User } from '../../@types/entities/user';
import { IndexableType } from '../../@types/indexableProperties';
import { AllEntityNames } from '../../@types/entities/allEntityNames';
import { Email } from '../../@types/email';
import { LoginLink } from '../../@types/entities/loginLink';
// TODO add types
// https://www.npmjs.com/package/@types/jsonwebtoken
const jwt = require('jsonwebtoken');

type APIRequestLoginLinkBody = {
  email: Email;
};

type APIRequestLoginLinkQuery = {
  // ! TODO
  callbackUrl?: string;
};

// TODO switch to zod
const schema = Joi.object({
  body: {
    email: Joi.string().email(),
  },
  // query: {
  //   callbackUrl: Joi.string().uri(),
  // },
}).options(JOI_SETTINGS);
export const requestLoginLink = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    return res.status(400).json({ message: 'An error ocurred', error });
  }

  const { email } = req.body as APIRequestLoginLinkBody;

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
  let user: User | undefined;

  const findUserFilter: Filter<User> = {
    relatedTo: { $elemMatch: { id: email, type: IndexableType.Email } },
  };

  try {
    user = await req.items.findOne<User>(findUserFilter);
  } catch (error) {
    const msg = `Error retrieving user info`;
    console.error(msg, error);
    return res.status(500).json({
      message: msg,
      error,
    });
  }

  let newUserCreated = false;
  if (!user) {
    console.log('User not found:', email);
    try {
      console.log(`Creating new user`);
      const userCreationDate = new Date();

      const newUserId = generatePlutomiId({
        date: userCreationDate,
        entity: AllEntityNames.User,
      });

      const newUser: User = {
        _id: newUserId,
        org: null,
        workspace: null,
        email,
        entityType: AllEntityNames.User,
        createdAt: userCreationDate,
        updatedAt: userCreationDate,
        firstName: null,
        lastName: null,
        emailVerified: false,
        canReceiveEmails: true,
        totals: {
          invites: 0,
          memberships: 0,
          workspaces: 0,
        },
        relatedTo: [
          { id: AllEntityNames.User, type: IndexableType.Entity },
          { id: newUserId, type: IndexableType.Id },
          // Org
          { id: null, type: IndexableType.User },
          // Workspace
          { id: null, type: IndexableType.User },
          { id: email, type: IndexableType.Email },
        ],
      };

      console.log(`Creating new user`, newUser);

      await req.items.insertOne(newUser);

      console.log(`User created!`);
      user = newUser;
      newUserCreated = true;
    } catch (error) {
      const errMsg = `An error ocurred creating your account`;
      console.error(errMsg, error);
      return res.status(500).json({ message: errMsg, error });
    }
  }

  // TODO add a test for this @jest
  if (!user.canReceiveEmails) {
    return res.status(403).json({
      message: `'${email}' is unable to receive emails, please reach out to support@plutomi.com to opt back in!`,
    });
  }

  let latestLoginLink: LoginLink;

  const loginLinkFilter: Filter<LoginLink> = {
    $and: [{ relatedTo: { $elemMatch: { id: user._id, type: IndexableType.LoginLink } } }],
  };

  if (!newUserCreated) {
    // Get the latest login link if a returning user
    const loginLinkFindOptions: FindOptions<LoginLink> = {
      sort: {
        createdAt: -1,
      },
      limit: 1,
    };

    try {
      const latestLinkArray = await req.items
        .find<LoginLink>(loginLinkFilter, loginLinkFindOptions)
        .toArray();

      latestLoginLink = latestLinkArray[0];
    } catch (error) {
      console.error(`An error ocurred finding your info (login links error)`);
      return res
        .status(500)
        .json({ message: 'An error ocurred finding your info (login links error)' });
    }
  }

  const now = new Date();

  if (
    latestLoginLink &&
    latestLoginLink.createdAt >= Time(now).subtract(10, 'minutes').toDate() &&
    !email.endsWith(DOMAIN_NAME) // Allow admins to send multiple login links in a short time-span
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
  const userId = user._id;

  try {
    const loginLinkId = generatePlutomiId({ date: now, entity: AllEntityNames.LoginLink });
    const newLoginLink: LoginLink = {
      _id: loginLinkId, // ! TODO nested user property with target.id
      createdAt: now,
      updatedAt: now,
      entityType: AllEntityNames.LoginLink,
      expiresAt: linkExpiry.toISOString(),
      totals: {},
      relatedTo: [
        { id: AllEntityNames.LoginLink, type: IndexableType.Entity },
        { id: loginLinkId, type: IndexableType.Id },
        { id: user.org, type: IndexableType.LoginLink },
        { id: user.workspace, type: IndexableType.LoginLink },
        { id: user._id, type: IndexableType.LoginLink },
      ],
    };

    await req.items.insertOne(newLoginLink);

    // TODO types
    const tokenData = {
      userId,
      loginLinkId: newLoginLink._id,
    };

    token = await jwt.sign(tokenData, envVars.LOGIN_LINKS_SECRET, {
      expiresIn: Time().add(10, 'minutes').unix() - Time().unix(), // ! TODO?!?!?
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
      to: email,
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
