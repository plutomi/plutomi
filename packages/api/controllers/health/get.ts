import { RequestHandler } from "express";

export const get: RequestHandler = async (req, res) => {
  res.status(200).json({ message: "Hello World" });
};
