import { Request, Response, NextFunction } from "express";

export default async function withAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.session.user) {
    req.session.destroy();
    return res.status(401).json({
      message: "Please log in again",
    }); // TODO error messages
  }

  next();
}
