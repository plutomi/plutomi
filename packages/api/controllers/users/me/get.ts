import type { RequestHandler } from "express";

export const get: RequestHandler = async (req, res) => {
  res.send(req.user);
};
