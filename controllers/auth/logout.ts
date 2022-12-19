import { Request, Response } from 'express';
import { COOKIE_NAME, COOKIE_SETTINGS } from '../../Config';

// TODO create logout event in Mongo
export const logout = async (_req: Request, res: Response) => {
  res.cookie(COOKIE_NAME, '', {
    ...COOKIE_SETTINGS,
    signed: false,
    maxAge: -1,
  });

  return res.sendStatus(200);
};
