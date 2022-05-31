import { Request, Response } from 'express';

export const self = async (req: Request, res: Response) => {
  const { session } = res.locals;
  return res.status(200).json(session);
};
