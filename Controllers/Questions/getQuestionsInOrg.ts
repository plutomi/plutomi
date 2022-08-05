import { Request, Response } from 'express';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const getQuestionsInOrg = async (req: Request, res: Response) => {
  const { user } = req;

  const [questions, questionsError] = await DB.Questions.getQuestionsInOrg({
    orgId: user.org,
  });

  if (questionsError) {
    const { status, body } = CreateError.SDK(
      questionsError,
      'An error ocurred retrieving your questions',
    );
    return res.status(status).json(body);
  }
  return res.status(200).json(questions);
};
