import { Request, Response, NextFunction } from "express";
// Temporary
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

export const methodNotAllowed = (
  req: Request,
  res: Response,
  next: NextFunction
) => res.status(405).json({ message: "Method not allowed" });
export const routeNotFound = (
  req: Request,
  res: Response,
  next: NextFunction
) => res.status(404).json({ message: "Not found" });

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

export const withAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user) {
    req.session.destroy();
    return res.status(401).json({
      message: "Please log in again",
    }); // TODO error messages
  }

  next();
};
