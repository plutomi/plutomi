import { Request, Response } from 'express';
import { Filter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { QuestionEntity } from '../../models';
import { findInTargetArray } from '../../utils';
import { collections } from '../../utils/connectToDatabase';

export const getQuestionsInOrg = async (req: Request, res: Response) => {
  const { user } = req;
  const org = findInTargetArray(IndexableProperties.Org, user);

  let questions: QuestionEntity[] | undefined;
  try {
    const questionsFilter: Filter<QuestionEntity> = {
      target: { property: IndexableProperties.Org, value: org },
    };
    questions = (await collections.questions.find(questionsFilter).toArray()) as QuestionEntity[];
    return res.status(200).json(questions);
  } catch (error) {
    const msg = 'An error ocurred retrieving questions in this org';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  }
};
