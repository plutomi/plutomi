import { Request, Response, NextFunction } from 'express';
import { DEFAULTS, ERRORS } from '../Config';
import { IndexedEntities } from '../types/main';
import { findInTargetArray } from '../utils/findInTargetArray';
import TagGenerator from '../utils/tagGenerator';
// Blocks the request if a user is not in an org
// eslint-disable-next-line consistent-return
export default async function withHasOrg(req: Request, res: Response, next: NextFunction) {
  const { user } = req;

  const orgId = findInTargetArray({ entity: IndexedEntities.Org, targetArray: user.target });
  if (!orgId || orgId === TagGenerator({ value: DEFAULTS.NO_ORG })) {
    // TODO remove defaults no_org as we can now check if its undefined
    return res.status(403).json({
      message: ERRORS.NEEDS_ORG,
    });
  }

  next();
}
