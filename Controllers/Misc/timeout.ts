import { Request, Response } from 'express';
// TODO types
export const haltOnTimeout = async (req, res: Response, next) => {
  if (!req.timedout) next();
};
