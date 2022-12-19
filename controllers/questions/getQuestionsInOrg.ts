import { Request, Response } from 'express';
import { Filter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { QuestionEntity } from '../../models';
import { findInTargetArray } from '../../utils';
import { collections } from '../../utils/connectToDatabase';

export const getQuestionsInOrg = async (req: Request, res: Response) => {
  const { user } = req;
  const { orgId } = user;

  let questions: QuestionEntity[] | undefined;

  try {
    const questionsFilter: Filter<QuestionEntity> = {
      orgId,
    };
    questions = (await collections.questions.find(questionsFilter).toArray()) as QuestionEntity[];
    return res.status(200).json(questions);
  } catch (error) {
    const msg = 'An error ocurred retrieving questions in this org';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  }
};
