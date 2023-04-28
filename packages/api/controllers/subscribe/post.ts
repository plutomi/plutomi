import type { Handler, RequestHandler } from "express";

export const post: RequestHandler = async (req, res) => {
  res.status(200).json({ message: "Success" });
};
