import { Request, Response, NextFunction } from 'express';
import TagGenerator from '../utils/tagGenerator';
/**
 * Cleans up the questionId, whether in body, params, or query, to be URL safe
 */
// eslint-disable-next-line consistent-return
export default async function withCleanQuestionId(req: Request, res: Response, next: NextFunction) {
  if (req.body.questionId) {
    try {
      req.body.questionId = TagGenerator({
        value: req.body.questionId,
        joinString: '_',
      });
    } catch (error) {
      const message = `An error ocurred parsing req.body.questionId - ${error}`;
      return res.status(400).json({ message });
    }
  }

  if (req.params.questionId) {
    try {
      req.params.questionId = TagGenerator({
        value: req.params.questionId,
        joinString: '_',
      });
    } catch (error) {
      const message = `An error ocurred parsing req.params.questionId - ${error}`;
      return res.status(400).json({ message });
    }
  }

  if (req.query.questionId) {
    try {
      req.query.questionId = TagGenerator({
        value: req.params.questionId,
        joinString: '_',
      });
    } catch (error) {
      const message = `An error ocurred parsing req.query.questionId - ${error}`;
      console.error(message);
      return res.status(400).json({ message });
    }
  }

  // TODO make sure its an array // Yup / Joi
  if (req.body.questionOrder) {
    try {
      req.body.questionOrder = req.body.questionOrder.map((id: string) =>
        TagGenerator({ value: id, joinString: '_' }),
      );
    } catch (error) {
      const message = `An error ocurred parsing req.body.questionOrder - ${error}`;
      console.error(message);
      return res.status(400).json({ message });
    }
  }

  next();
}
