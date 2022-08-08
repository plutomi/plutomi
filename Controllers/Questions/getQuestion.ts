import { Request, Response } from 'express';
import { Question } from '../../entities/Question';
import { DB } from '../../models';
import * as CreateError from '../../utils/createError';

export const getQuestion = async (req: Request, res: Response) => {
  const { user } = req;
  const { questionId } = req.params;

  try {
    const question = await Question.findById(questionId, {
      org: user.org,
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    return res.status(200).json(question);
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving that question' });
  }
};
