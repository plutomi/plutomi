import { Request, Response, NextFunction } from 'express';
import { DEFAULTS, ERRORS } from '../Config';
import TagGenerator from '../utils/tagGenerator';
// Blocks the request if a user is not in an org
export default async function withHasOrg(req: Request, res: Response, next: NextFunction) {
  const { session } = res.locals;

  if (
    session.orgId === DEFAULTS.NO_ORG ||
    session.orgId === TagGenerator({ value: DEFAULTS.NO_ORG })
  ) {
    return res.status(403).json({
      message: ERRORS.NEEDS_ORG,
    });
  }

  next();
}
