import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import * as CreateError from '../../utils/createError';
import { DB } from '../../models';
import { COOKIE_NAME, COOKIE_SETTINGS, Emails } from '../../Config';
import { IUser, User } from '../../entities/User';

/**
 * Creates a random test user and sends a session cookie to the client
 * @param req
 * @param res
 */
export const jestSetup = async (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'development') {
    // TODO add a key for another layer of security here
    return res.status(401).json({ message: 'NODE_ENV is not development' });
  }

  // TODO this is creating two users under TESTING2 because theres no check to see if email exists
  // like in the regular createUser flow
  const userEmail = req.body.email || `${nanoid(15)}+${Emails.TESTING}`;

  try {
    const user = await User.findOne({
      email: userEmail,
    });

    let createdUser: IUser | undefined;

    if (!user) {
      try {
        const newUser = new User({
          email: userEmail,
        });

        await newUser.save();
        createdUser = newUser;
      } catch (error) {
        return res.status(500).json({ message: 'An error ocurred creating a new user for jest' });
      }
    }

    res.cookie(COOKIE_NAME, createdUser._id, COOKIE_SETTINGS);

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve user by email' });
  }
};
