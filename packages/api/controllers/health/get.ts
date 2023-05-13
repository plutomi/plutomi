import type { RequestHandler } from "express";

export const get: RequestHandler = async (req, res) => {
  res.status(200).json({ message: "Saul Goodman" });
};
