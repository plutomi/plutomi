import { Request, Response } from 'express';
import Joi from 'joi';
import * as CreateError from '../../utils/createError';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import { DynamoQuestion } from '../../types/dynamo';
import { DB } from '../../models';

export interface APIUpdateQuestionOptions
  extends Partial<Pick<DynamoQuestion, 'GSI1SK' | 'description'>> {}

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

  console.log(`REQ BODY`, req.body);

  const { user } = req;
  const { questionId } = req.params;
  let updatedValues: APIUpdateQuestionOptions = {};

  if (req.body.GSI1SK) {
    updatedValues.GSI1SK = req.body.GSI1SK;
  }

  if (req.body.description || req.body.description === '') {
    updatedValues.description = req.body.description;
  }
  const [question, questionError] = await DB.Questions.updateQuestion({
    orgId: user.orgId,
    questionId,
    updatedValues,
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
