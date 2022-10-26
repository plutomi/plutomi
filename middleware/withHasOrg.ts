import { Request, Response, NextFunction } from 'express';
import { IndexableProperties } from '../@types/indexableProperties';
import { ERRORS } from '../Config';
import { findInTargetArray } from '../utils/findInTargetArray';
// Blocks the request if a user is not in an org
// eslint-disable-next-line consistent-return
export default async function withHasOrg(req: Request, res: Response, next: NextFunction) {
  const { user } = req;

  const orgId = findInTargetArray(IndexableProperties.Org, user);
  if (!orgId) {
    return res.status(403).json({
      message: ERRORS.NEEDS_ORG, // TODO casing
    });
  }

  next();
}
