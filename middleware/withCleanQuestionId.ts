import { Request, Response, NextFunction } from "express";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString({ joinString: "_" });

/**
 * Cleans up the questionId, whether in body, params, or query, to be URL safe
 */
export default async function withQuestionId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.body.questionId) {
    req.body.questionId = tagGenerator.generate(req.body.questionId);
  }

  if (req.params.questionId) {
    req.params.questionId = tagGenerator.generate(req.params.questionId);
  }

  if (req.query.questionId) {
    // TODO types
    // @ts-ignore
    req.query.questionId = tagGenerator.generate(req.query.questionId);
  }

  next();
}
