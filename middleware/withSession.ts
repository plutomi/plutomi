import { Request, Response, NextFunction } from 'express';
import { COOKIE_NAME, COOKIE_SETTINGS, WEBSITE_URL } from '../Config';
import { User } from '../entities';

// eslint-disable-next-line consistent-return
export default async function withSession(req: Request, res: Response, next: NextFunction) {
  const userId = req.signedCookies[COOKIE_NAME];
  if (!userId) {
    res.location(WEBSITE_URL);
    return res.status(401).json({ message: 'Please log in again' });
  }

  let user: User;
  let error: any;
  try {
    user = await req.entityManager.findOne(User, {
      id: userId,
    });
  } catch (err) {
    console.error(`User not found due to error`, error);
    error = err;
  }

  if (!user || error) {
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
