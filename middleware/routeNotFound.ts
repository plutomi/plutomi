import { Request, Response, NextFunction } from "express";

export default async function routeNotFound(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return res.status(404).json({ message: "Not found" });
}
