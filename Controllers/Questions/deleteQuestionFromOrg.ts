import { Request, Response } from 'express';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const deleteQuestionFromOrg = async (req: Request, res: Response) => {
  const { user } = req;

  const [success, failure] = await DB.Questions.deleteQuestionFromOrg({
    orgId: user.orgId,
    questionId: req.params.questionId,
    updateOrg: true,
  });

  if (failure) {
    if (failure.name === 'TransactionCanceledException') {
      return res.status(401).json({ message: 'It seems like that question no longer exists' });
    }

    const { status, body } = CreateError.SDK(failure, 'An error ocurred deleting that question');
    return res.status(status).json(body);
  }

  return res.status(200).json({ message: 'Question deleted!' });
};
