import { Request, Response } from 'express';
import Joi from 'joi';
import * as CreateError from '../../utils/createError';
import { DynamoQuestion } from '../../types/dynamo';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import { DB } from '../../models';
import { Question } from '../../entities/Question';

export type APICreateQuestionOptions = Pick<
  DynamoQuestion,
  'questionId' | 'GSI1SK' | 'description'
>;
const schema = Joi.object({
  body: {
    questionId: Joi.string().max(50), // TODO joi regex to match tag generator
    GSI1SK: Joi.string().max(LIMITS.MAX_QUESTION_TITLE_LENGTH),
    description: Joi.string().allow('').max(LIMITS.MAX_QUESTION_DESCRIPTION_LENGTH),
  },
}).options(JOI_SETTINGS);

export const createQuestion = async (req: Request, res: Response) => {
  const { user } = req;

  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }
  const { questionId, description, GSI1SK }: APICreateQuestionOptions = req.body;

  try {
    const newQuestion = new Question({
      _id: questionId,
      title: GSI1SK, // TODO update this to be title,
      description,
      org: user.org,
    });

    await newQuestion.save();
    return res.status(201).json({ message: 'Question created!' });
  } catch (error) {
    return res.status(500).json({ message: 'An error curred saving question' });
  }
};
