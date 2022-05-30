import { Request, Response, NextFunction } from 'express';
import { ERRORS } from '../Config';

// Blocks the request if a user is not in the same org as the orgId parameter
// eslint-disable-next-line consistent-return
export default async function withSameOrg(req: Request, res: Response, next: NextFunction) {
  const { session } = res.locals;

  if (session.orgId !== req.params.orgId) {
    return res.status(403).json({
      message: ERRORS.NOT_SAME_ORG,
    });
  }
  next();
}
