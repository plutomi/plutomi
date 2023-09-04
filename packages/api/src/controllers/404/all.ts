import type { RequestHandler } from "express";

export const all: RequestHandler = async (req, res) => {
  res.status(404).json({ message: "Not Found" });
};
