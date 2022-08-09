import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, WEBSITE_URL, COOKIE_NAME, COOKIE_SETTINGS, Emails } from '../../Config';
import * as CreateError from '../../utils/createError';
import { sendEmail, SendEmailProps } from '../../models/Emails/sendEmail';
import { IUser, User } from '../../entities/User';

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

  let userId: string;
  let loginLinkId: string;

  try {
    const data = await jwt.verify(token, process.env.LOGIN_LINKS_PASSWORD);

    userId = data.userId;
    loginLinkId = data.loginLinkId;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Login link expired :(' });
    }
    return res.status(401).json({ message: 'Invalid login link' });
  }

  let user: IUser | undefined;

  try {
    const result = await User.findById(userId);

    if (result) {
      user = result;
    }
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving your user' });
  }

  // If a user is deleted between when they made they requested the login link
  // and when they attempted to sign in... somehow
  if (!user) {
    return res.status(401).json({
      message: `Please contact support, your user account appears to be deleted.`,
    });
  }

  // TODO create login event

  // TODO create login event if user is in org

  // TODO MAJOR - Delete login link!
  // https://blog.tericcabrel.com/how-to-use-mongodb-transaction-in-node-js/
  res.cookie(COOKIE_NAME, user._id, COOKIE_SETTINGS);
  res.header('Location', callbackUrl);

  /**
   * If a user has invites, redirect them to the invites page
   * on login regardless of the callback url
   */
  if (user.totalInvites > 0) {
    res.header('Location', `${WEBSITE_URL}/invites`);
  }

  res.status(307).json({ message: 'Login success!' });

  console.log(`LOGGIN USER`, user);
  // User logged in for the first time
  if (!user.verifiedEmail) {
    try {
      try {
        const res = await User.updateOne(
          {
            _id: user._id,
          },
          {
            $set: {
              verifiedEmail: true,
            },
          },
        );
        console.log(`RESULT`, res);
      } catch (error) {
        console.error('ERROR UPDATING EMAIL VERIFIED', error);
      }

      const emailsToSend: SendEmailProps[] = [
        {
          to: user.email,
          from: {
            header: 'Plutomi',
            email: Emails.JOSE,
          },
          subject: 'Welcome to Plutomi!',
          body: `<h1>Hello there!</h1><p>Jose here, CEO of Plutomi.<br></br>Just wanted to make you aware that this website is still in active development and <strong>you will lose your data!</strong><br><br>
            This project is completely open source - please let us know if you have any questions, concerns, or feature requests by <a href="https://github.com/plutomi/plutomi" rel=noreferrer target="_blank" >creating an issue on Github</a> or replying to this email! <br></br><br></br><strong>I answer all emails!</strong> <i>Seriously</i>, try me :)</p>`,
        },
        {
          from: {
            header: `Plutomi`,
            email: Emails.ADMIN,
          },
          to: Emails.ADMIN,
          subject: `New user has joined! - ${user.email}`,
          body: `<h1>Their ID is ${user._id}</h1>`,
        },
      ];

      try {
        console.log(`Sending emails:`, emailsToSend);
        await Promise.all(emailsToSend.map(async (email) => sendEmail(email)));
        console.log('All emails sent!');
        return;
      } catch (error) {
        console.error('Error ocurred sending new user emails', error);
      }
    } catch (error) {
      console.error(`An error ocurred updating the user's 'verifiedEmail' status`);
    }
  }
};
