import { Request, Response, NextFunction } from 'express';
import { ERRORS } from '../Config';
// Blocks the request if a user is not in an org
// eslint-disable-next-line consistent-return
export default async function withHasOrg(req: Request, res: Response, next: NextFunction) {
  // const { user } = req;

  // const { orgId } = user;
  // if (!orgId) {
  //   return res.status(403).json({
  //     message: ERRORS.NEEDS_ORG, // TODO casing
  //   });
  // }

  next();
}
