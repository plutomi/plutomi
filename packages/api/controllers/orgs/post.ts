import { Schema, validate } from "@plutomi/validation";
import type { RequestHandler, Request, Response } from "express";

export const post: RequestHandler = async (req: Request, res: Response) => {
  const { data, errorHandled } = validate({
    req,
    res,
    schema: Schema.Orgs.post.APISchema
  });

  if (errorHandled) {
    return;
  }

  const { displayName } = data;

  res.status(200).json({ message: displayName });
};
