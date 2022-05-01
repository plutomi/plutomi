import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import * as Users from '../models/Users';
import * as CreateError from '../utils/createError';
import { COOKIE_NAME, COOKIE_SETTINGS, EMAILS } from '../Config';
/**
 * Creates a random test user and sends a session cookie to the client
 * @param req
 * @param res
 */
export const setup = async (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'development') {
    // TODO add a key for another layer of security here
    return res.status(401).json({ message: 'NODE_ENV is not development' });
  }

  // TODO this is creating two users under TESTING2 because theres no check to see if email exists
  // like in the regular createUser flow
  const userEmail = req.body.email || `${nanoid(15)}+${EMAILS.TESTING}`;
  let [user, userError] = await Users.GetUserByEmail({
    email: userEmail,
  });

  if (userError) {
    const { status, body } = CreateError.SDK(userError, 'An error ocurred creating your jest user');
    return res.status(status).json(body);
  }

  if (!user) {
    const [newUser, newUserError] = await Users.CreateUser({
      email: userEmail,
    });

    if (newUserError) {
      const { status, body } = CreateError.SDK(newUserError, 'Error ocurred creating test user');
      return res.status(status).json(body);
    }

    user = newUser;
  }

  res.cookie(COOKIE_NAME, user.userId, COOKIE_SETTINGS);

  return res.status(201).json(user);
};
