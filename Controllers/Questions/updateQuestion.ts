import { Request, Response } from 'express';
import Joi from 'joi';
import * as CreateError from '../../utils/createError';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import { DynamoQuestion } from '../../types/dynamo';
import { DB } from '../../models';
import { Question } from '../../entities/Question';

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

  const { user } = req;
  const { questionId } = req.params;

  try {
    const newQuestion = await Question.findOne(
      {
        _id: questionId,
      },
      {
        orgId: user.org,
      },
    );
    if (!newQuestion) {
      return res.status(404).json({ message: 'Question does not exist' });
    }

    // todo UPDATE THIS valuye
    if (req.body.GSI1sk) {
      newQuestion.title = req.body.GSI1SK;
    }

    if (req.body.description) {
      newQuestion.description = req.body.description;
    }

    try {
      await newQuestion.save();
      return res.status(200).json({ message: 'Question updated!' });
    } catch (error) {
      return res.status(500).json({ message: 'An error ocurred saving that question' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'An error courred updatng the question' });
  }
};
