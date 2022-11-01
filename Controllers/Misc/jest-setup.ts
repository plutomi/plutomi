import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { COOKIE_NAME, COOKIE_SETTINGS, Emails } from '../../Config';
import { env } from '../../env';

/**
 * Creates a random test user and sends a session cookie to the client
 * @param req
 * @param res
 */
export const jestSetup = async (req: Request, res: Response) => {
  if (env.nodeEnv !== 'development') {
    // TODO add a key for another layer of security here
    return res.status(401).json({ message: 'NODE_ENV is not development' });
  }

  // TODO this is creating two users under TESTING2 because theres no check to see if email exists
  // like in the regular createUser flow
  const userEmail = req.body.email || `${nanoid(15)}+${Emails.TESTING}`;

  return res.status(200).json({ message: 'Endpoint temp disabled' });

  // let [user, userError] = await DB.Users.getUserByEmail({
  //   email: userEmail,
  // });

  // if (userError) {
  //   const { status, body } = CreateError.SDK(userError, 'An error ocurred creating your jest user');
  //   return res.status(status).json(body);
  // }

  // if (!user) {
  //   const [newUser, newUserError] = await DB.Users.createUser({
  //     email: userEmail,
  //   });

  //   if (newUserError) {
  //     const { status, body } = CreateError.SDK(newUserError, 'Error ocurred creating test user');
  //     return res.status(status).json(body);
  //   }

  //   user = newUser;
  // }

  // res.cookie(COOKIE_NAME, user.userId, COOKIE_SETTINGS);

  // return res.status(201).json(user);
};
