import { Request, Response } from 'express';
import DB from '../../../models';
import * as CreateError from '../../../utils/createError';

export const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const { questionId } = req.params;
  const [question, questionError] = await DB.Questions.getQuestion({
    orgId: session.orgId,
    questionId,
  });

  if (questionError) {
    const { status, body } = CreateError.SDK(
      questionError,
      'An error ocurred retrieving that question',
    );
    return res.status(status).json(body);
  }
  return res.status(200).json(question);
};
