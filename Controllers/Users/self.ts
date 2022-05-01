import { Request, Response } from 'express';

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  return res.status(200).json(session);
};
export default main;
