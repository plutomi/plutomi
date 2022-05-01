import { Request, Response, NextFunction } from 'express';
import TagGenerator from '../utils/tagGenerator';
/**
 * Cleans up the orgId, whether in body, params, or query, to be URL safe
 */
export default async function withCleanOrgId(req: Request, res: Response, next: NextFunction) {
  if (req.body.orgId) {
    req.body.orgId = TagGenerator({ value: req.body.orgId });
  }

  if (req.params.orgId) {
    req.params.orgId = TagGenerator({ value: req.params.orgId });
  }

  if (req.query.orgId) {
    req.query.orgId = TagGenerator({ value: req.query.orgId as string });
  }

  next();
}
