import { Request, Response } from 'express';

export const self = async (req: Request, res: Response) => {
  return res.status(200).json(req.user);
};
