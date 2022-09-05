import { Request, Response } from 'express';

export const healthCheck = async (_req: Request, res: Response) => {
  return res.status(200).json({ message: "It's all good man!" });
};
