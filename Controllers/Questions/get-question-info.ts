import { Request, Response } from 'express';
import * as Questions from '../../models/Questions';
import * as CreateError from '../../utils/createError';
const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const { questionId } = req.params;
  const [question, questionError] = await Questions.GetQuestionById({
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
export default main;
