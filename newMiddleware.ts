import { Request, Response, NextFunction } from "express";
// Temporary
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

export const methodNotAllowed = (
  req: Request,
  res: Response,
  next: NextFunction
) => res.status(405).send();
export const routeNotFound = (
  req: Request,
  res: Response,
  next: NextFunction
) => res.status(404).send();
// Switch the above to return res.status(NUMBER).json({message: "error name ^"})

export const cleanOrgId = (req: Request, res: Response, next: NextFunction) => {
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
};
