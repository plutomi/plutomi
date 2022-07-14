import { Request, Response, NextFunction } from 'express';
import { COOKIE_NAME, COOKIE_SETTINGS } from '../Config';
import { DB } from '../models';

// eslint-disable-next-line consistent-return
export default async function withSession(req: Request, res: Response, next: NextFunction) {
  const userId = req.signedCookies[COOKIE_NAME];
  if (!userId) {
    return res.status(401).json({ message: 'Please log in again' });
  }

  const [user, userError] = await DB.Users.getUserById({
    userId,
  });

  if (userError || !user) {
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
