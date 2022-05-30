import { Request, Response, NextFunction } from 'express';
import TagGenerator from '../utils/tagGenerator';
/**
 * Cleans up the questionId, whether in body, params, or query, to be URL safe
 */
// eslint-disable-next-line consistent-return
export default async function withCleanQuestionId(req: Request, res: Response, next: NextFunction) {
  if (req.body.questionId) {
    req.body.questionId = TagGenerator({
      value: req.params.questionId,
      joinString: '_',
    });
  }

  if (req.params.questionId) {
    req.params.questionId = TagGenerator({
      value: req.params.questionId,
      joinString: '_',
    });
  }

  if (req.query.questionId) {
    req.query.questionId = TagGenerator({
      value: req.params.questionId,
      joinString: '_',
    });
  }
  if (req.body.questionOrder) {
    try {
      req.body.questionOrder = req.body.questionOrder.map((id: string) =>
        TagGenerator({ value: id, joinString: '_' }),
      );
    } catch (error) {
      const message = `An error ocurred cleaning questionIds in the questionOrder body - ${error}`;
      console.error(message);
      return res.status(400).json({ message });
    }
  }

  next();
}
