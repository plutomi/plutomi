import { Request, Response, NextFunction } from "express";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

export default async function withCleanOrgId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  /**
   * Makes the orgId, whether in the url params or in the body, have a specific, URL Safe, format
   */

  if (req.body.orgId) {
    req.body.orgId = tagGenerator.generate(req.body.orgId);
  }

  if (req.params.orgId) {
    req.params.orgId = tagGenerator.generate(req.params.orgId);
  }
  next();
}
