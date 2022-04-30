import { Request, Response, NextFunction } from 'express';
const UrlSafeString = require('url-safe-string'),
  tagGenerator = new UrlSafeString({ joinString: '_' });

/**
 * Cleans up the questionId, whether in body, params, or query, to be URL safe
 */
export default async function withCleanQuestionId(req: Request, res: Response, next: NextFunction) {
  if (req.body.questionId) {
    req.body.questionId = tagGenerator.generate(req.body.questionId);
  }

  if (req.params.questionId) {
    req.params.questionId = tagGenerator.generate(req.params.questionId.toString());
  }

  if (req.query.questionId) {
    req.query.questionId = tagGenerator.generate(req.query.questionId);
  }
  if (req.body.questionOrder) {
    try {
      req.body.questionOrder = req.body.questionOrder.map((id: string) =>
        tagGenerator.generate(id),
      );
    } catch (error) {
      const message = `An error ocurred cleaning questionIds in the questionOrder body - ${error}`;
      console.error(message);
      return res.status(400).json({ message });
    }
  }

  next();
}
