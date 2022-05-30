import { Request, Response } from 'express';
import { deleteQuestionFromOrg } from '../../models/Questions';
import * as CreateError from '../../utils/createError';

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;

  const [success, failure] = await deleteQuestionFromOrg({
    orgId: session.orgId,
    questionId: req.params.questionId,
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
export default main;
