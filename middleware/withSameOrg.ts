import { Request, Response, NextFunction } from 'express';
import { Schema } from 'mongoose';
import { ERRORS } from '../Config';

// ! NOTE - Middleware requires to be used inline as req.params are not available in middleware in nested routes
// Blocks the request if a user is not in the same org as the orgId parameter
// eslint-disable-next-line consistent-return
export default async function withSameOrg(req: Request, res: Response, next: NextFunction) {
  const { user } = req;
  // TODO types
  if (user.org !== (req.params.orgId as unknown as Schema.Types.ObjectId)) {
    return res.status(403).json({
      message: ERRORS.NOT_SAME_ORG,
    });
  }
  next();
}
