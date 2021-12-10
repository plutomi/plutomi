import { Request, Response, NextFunction } from "express";

export default async function methodNotAllowed(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return res.status(405).json({ message: "Method not allowed" });
}
