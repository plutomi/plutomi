import { Request, Response } from 'express';

export const me = async (req: Request, res: Response) => {
  console.log(`ME!`)
  return res.status(200).json(req.user);
};
