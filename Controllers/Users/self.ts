import { Request, Response } from 'express';

export const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  return res.status(200).json(session);
};
