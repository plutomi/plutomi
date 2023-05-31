import type { RequestHandler, Request, Response } from "express";

export const post: RequestHandler = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Noice.gif" });
};
