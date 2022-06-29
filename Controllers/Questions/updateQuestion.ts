import { Request, Response } from 'express';
import Joi from 'joi';
import * as CreateError from '../../utils/createError';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import { DynamoQuestion } from '../../types/dynamo';
import { DB } from '../../models';

export interface APIUpdateQuestionOptions
  extends Partial<Pick<DynamoQuestion, 'GSI1SK' | 'description'>> {
  [key: string]: any;
}

const schema = Joi.object({
  GSI1SK: Joi.string().max(LIMITS.MAX_QUESTION_TITLE_LENGTH),
  description: Joi.string().allow('').max(LIMITS.MAX_QUESTION_DESCRIPTION_LENGTH),
}).options(JOI_SETTINGS);

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { user } = req;
  const { questionId } = req.params;

  const [question, questionError] = await DB.Questions.updateQuestion({
    orgId: user.orgId,
    questionId,
    newValues: req.body,
  });

  if (questionError) {
    const { status, body } = CreateError.SDK(
      questionError,
      'An error ocurred updating this question',
    );
    return res.status(status).json(body);
  }

  return res.status(200).json({
    message: 'Question updated!',
  });
};
