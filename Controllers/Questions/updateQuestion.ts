import { Request, Response } from 'express';
import Joi from 'joi';
import { Filter, UpdateFilter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import { QuestionEntity, StageEntity } from '../../models';
import { findInTargetArray } from '../../utils';
import { collections } from '../../utils/connectToDatabase';

// export interface APIUpdateQuestionOptions
//   extends Partial<Pick<DynamoQuestion, 'GSI1SK' | 'description'>> {}

const schema = Joi.object({
  GSI1SK: Joi.string().max(LIMITS.MAX_QUESTION_TITLE_LENGTH),
  description: Joi.string().allow('').max(LIMITS.MAX_QUESTION_DESCRIPTION_LENGTH),
}).options(JOI_SETTINGS);

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).json({ message: 'An error ocurred', error });
  }

  const { user } = req;
  const { questionId } = req.params;
  const org = findInTargetArray(IndexableProperties.Org, user);

  const questionFilter: Filter<QuestionEntity> = {
    id: questionId,
    target: { property: IndexableProperties.Org, value: org },
  };

  let question: QuestionEntity | undefined;

  try {
    question = (await collections.questions.findOne(questionFilter)) as QuestionEntity;
  } catch (error) {
    const message = 'An error ocurred retrieving opening info';
    console.error(message, error);
    return res.status(500).json({ message });
  }

  if (!question) {
    return res.status(404).json({ message: 'Question not found!' });
  }

  const updateObject: Partial<QuestionEntity> = {};

  if (req.body.GSI1SK) {
    updateObject.title = req.body.GSI1SK;
  }

  if (req.body.description || req.body.description === '') {
    updateObject.description = req.body.description;
  }

  try {
    await collections.questions.updateOne(questionFilter, {
      $set: updateObject,
    });
  } catch (error) {
    const msg = 'An error ocurred updating that question';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  }

  return res.status(200).json({
    message: 'Question updated!',
  });
};
