import { Request, Response, NextFunction } from 'express';
import { IndexableProperties } from '../@types/indexableProperties';
import { ERRORS } from '../Config';
import { findInTargetArray } from '../utils/findInTargetArray';

// ! NOTE - Middleware requires to be used inline as req.params are not available in middleware in nested routes
// Blocks the request if a user is not in the same org as the orgId parameter
export default async function withSameOrg(req: Request, res: Response, next: NextFunction) {
  const { user } = req;
  const { orgId } = user;

  if (orgId !== req.params.orgId || !orgId) {
    return res.status(403).json({
      message: ERRORS.NOT_SAME_ORG,
    });
  }
  next();
}
