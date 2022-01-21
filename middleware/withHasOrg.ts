import { Request, Response, NextFunction } from "express";
import { DEFAULTS, ERRORS } from "../Config";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();
export default async function withCleanOrgId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Blocks the request if a user is not in an org
  const { session } = res.locals;

  if (
    session.orgId === DEFAULTS.NO_ORG ||
    session.orgId === tagGenerator.generate(DEFAULTS.NO_ORG)
  ) {
    return res.status(403).json({
      message: ERRORS.NEEDS_ORG,
    });
  }
  next();
}
