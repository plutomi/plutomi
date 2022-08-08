import { Request, Response, NextFunction } from 'express';
import { COOKIE_NAME, COOKIE_SETTINGS } from '../Config';
import { IUser, User } from '../entities/User';
import { DB } from '../models';

// eslint-disable-next-line consistent-return
export default async function withSession(req: Request, res: Response, next: NextFunction) {
  const userId = req.signedCookies[COOKIE_NAME];
  if (!userId) {
    return res.status(401).json({ message: 'Please log in again' });
  }

  let user: IUser | undefined;

  try {
    let result = await User.findById(userId);

    // TODO duplicate logic
    if (!result) {
      res.cookie(COOKIE_NAME, '', {
        ...COOKIE_SETTINGS,
        maxAge: -1,
      });
      return res.status(401).json({
        message: 'An error ocurred retrieving your info, please log in again',
      });
    }

    user = result;
  } catch (error) {
    res.cookie(COOKIE_NAME, '', {
      ...COOKIE_SETTINGS,
      maxAge: -1,
    });
    return res.status(401).json({
      message: 'An error ocurred retrieving your info, please log in again',
    });
  }

  req.user = user;

  next();
}
