import requestIp from "request-ip";
import type { Request, Response, NextFunction } from "express";

export const withClientIp = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const clientIp = requestIp.getClientIp(req);
  req.ip = clientIp ?? "unknown";
  next();
};
