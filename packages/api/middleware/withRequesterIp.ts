import requestIp from "request-ip";
import type { Request, Response, NextFunction } from "express";

export const withRequesterIp = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.requesterIp = requestIp.getClientIp(req) ?? "unknown";
  next();
};
