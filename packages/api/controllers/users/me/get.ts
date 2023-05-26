import type { RequestHandler } from "express";

export const get: RequestHandler = async (req, res) => {
  res.status(400).json({ message: "test" });
  return;
  res.send(req.user);
};
