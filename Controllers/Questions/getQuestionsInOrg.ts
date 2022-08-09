import { Request, Response } from 'express';
import { Question } from '../../entities/Question';

export const getQuestionsInOrg = async (req: Request, res: Response) => {
  const { user } = req;

  try {
    const questions = await Question.find({
      org: user.org,
    });
    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving questions from the org' });
  }
};
