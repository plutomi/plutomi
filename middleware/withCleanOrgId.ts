import { Request, Response, NextFunction } from 'express';
const UrlSafeString = require('url-safe-string'),
  tagGenerator = new UrlSafeString();

/**
 * Cleans up the orgId, whether in body, params, or query, to be URL safe
 */
export default async function withCleanOrgId(req: Request, res: Response, next: NextFunction) {
  if (req.body.orgId) {
    req.body.orgId = tagGenerator.generate(req.body.orgId);
  }

  if (req.params.orgId) {
    req.params.orgId = tagGenerator.generate(req.params.orgId);
  }

  if (req.query.orgId) {
    // TODO types
    // @ts-ignore
    req.query.orgId = tagGenerator.generate(req.query.orgId);
  }

  next();
}
