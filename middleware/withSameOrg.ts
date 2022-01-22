import { Request, Response, NextFunction } from "express";
import { DEFAULTS, ERRORS } from "../Config";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();
export default async function withCleanOrgId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Blocks the request if a user is not in the same org
  const { session } = res.locals;

  if (session.orgId !== req.params.orgId) {
    return res.status(403).json({
      message: ERRORS.NOT_SAME_ORG,
    });
  }
  next();
}
