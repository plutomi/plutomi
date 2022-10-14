import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, WEBSITE_URL, COOKIE_NAME, COOKIE_SETTINGS, Emails } from '../../Config';
import * as CreateError from '../../utils/createError';
import { sendEmail, SendEmailProps } from '../../models/Emails/sendEmail';
import { env } from '../../env';
import { User, UserLoginLink } from '../../entities';
import { Reference } from '@mikro-orm/core';

const jwt = require('jsonwebtoken');

interface APILoginQuery {
  callbackUrl?: string;
  token?: string;
}

const schema = Joi.object({
  query: {
    callbackUrl: Joi.string().uri(),
    token: Joi.string(),
  },
}).options(JOI_SETTINGS);
export const login = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }
  const { callbackUrl, token }: APILoginQuery = req.query;
  const { entityManager } = req;

  let userId: string;
  let loginLinkId: string;

  try {
    // TODO add types for this
    const data = await jwt.verify(token, env.loginLinksPassword);

    console.log(`Token data`, data);

    userId = data.userId;
    loginLinkId = data.loginLinkId;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Login link expired :(' });
    }
    return res.status(401).json({ message: 'Invalid login link' });
  }
  console.log(`Trying to find user with ID of `, userId);

  let loginLink: UserLoginLink;

  let user: User;

  try {
    loginLink = await entityManager.findOne(UserLoginLink, {
      id: loginLinkId,
    });
    console.log(loginLink);

    user = Reference.unwrapReference(loginLink.user);
  } catch (error) {
    console.error(`ERROR retrieving login link`, error);
    return res.status(500).json({ message: 'An error ocurred retrieving login link data', error });
  }

  if (!loginLink) {
    return res.status(401).json({ message: 'Invalid login link' });
  }

  // TODO delete login link
  entityManager.remove(loginLink);
  await entityManager.flush();

  // TODO Create login event

  // // Marks the user's email as verified if its the first time logging in
  // const [success, failed] = await DB.Users.createLoginEvent({
  //   loginLinkId,
  //   user,
  // });

  // if (failed) {
  //   if (failed.name === 'TransactionCanceledException') {
  //     return res.status(401).json({ message: 'Login link no longer valid' });
  //   }
  //   const { status, body } = CreateError.SDK(error, 'Unable to create login event');

  //   return res.status(status).json(body);
  // }

  res.cookie(COOKIE_NAME, user.id, COOKIE_SETTINGS);
  res.header('Location', callbackUrl);

  /**
   * If a user has invites, redirect them to the invites page
   * on login regardless of the callback url
   */
  if (user.totalInvites > 0) {
    res.header('Location', `${WEBSITE_URL}/invites`);
  }

  res.status(307).json({ message: 'Login success!' });

  // TODO - POST MONGO
  // TODO send emails!
  // // User logged in for the first time
  // if (success && !user.verifiedEmail) {
  //   try {
  //     const emailsToSend: SendEmailProps[] = [
  //       {
  //         to: user.email,
  //         from: {
  //           header: 'Plutomi',
  //           email: Emails.JOSE,
  //         },
  //         subject: 'Welcome to Plutomi!',
  //         body: `<h1>Hello there!</h1><p>Jose here, CEO of Plutomi.<br></br>Just wanted to make you aware that this website is still in active development and <strong>you will lose your data!</strong><br><br>
  //           This project is completely open source - please let us know if you have any questions, concerns, or feature requests by <a href="https://github.com/plutomi/plutomi" rel=noreferrer target="_blank" >creating an issue on Github</a> or replying to this email! <br></br><br></br><strong>I answer all emails!</strong> <i>Seriously</i>, try me :)</p>`,
  //       },
  //       {
  //         from: {
  //           header: `Plutomi`,
  //           email: Emails.ADMIN,
  //         },
  //         to: Emails.ADMIN,
  //         subject: `New user has joined! - ${user.email}`,
  //         body: `<h1>Their ID is ${user.userId}</h1>`,
  //       },
  //     ];

  //     try {
  //       console.log(`Sending emails:`, emailsToSend);
  //       await Promise.all(emailsToSend.map(async (email) => sendEmail(email)));
  //       console.log('All emails sent!');
  //       return;
  //     } catch (error) {
  //       console.error('Error ocurred sending new user emails', error);
  //     }
  //   } catch (error) {
  //     console.error(`An error ocurred updating the user's 'verifiedEmail' status`);
  //   }
  // }
};
