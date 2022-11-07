import { Request, Response } from 'express';
import Joi from 'joi';
import { Filter, UpdateFilter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import { OrgEntity, QuestionEntity, QuestionType } from '../../models';
import { findInTargetArray } from '../../utils';
import { collections, mongoClient } from '../../utils/connectToDatabase';

// export type APICreateQuestionOptions = Pick<
//   QuestionEntity,
//   'questionId' | 'GSI1SK' | 'description'
// >;
const schema = Joi.object({
  body: {
    questionId: Joi.string().max(50), // TODO joi regex to match tag generator
    GSI1SK: Joi.string().max(LIMITS.MAX_QUESTION_TITLE_LENGTH),
    description: Joi.string().allow('').max(LIMITS.MAX_QUESTION_DESCRIPTION_LENGTH),
  },
}).options(JOI_SETTINGS);

export const createQuestion = async (req: Request, res: Response) => {
  const { user } = req;
  const org = findInTargetArray(IndexableProperties.Org, user);
  // try {
  //   await schema.validateAsync(req);
  // } catch (error) {
  //   const { status, body } = CreateError.JOI(error);
  //   return res.status(status).json(body);
  // }
  // TODO change these
  const { questionId, description, GSI1SK } = req.body;

  // TODO transaction

  // Increment totalQuestions count on org
  // Create question entity

  const session = mongoClient.startSession();
  const now = new Date();
  const newQuestion: QuestionEntity = {
    createdAt: now,
    updatedAt: now,
    id: questionId,
    description,
    totalStages: 0,
    type: QuestionType.Text,
    title: GSI1SK,
    target: [{ property: IndexableProperties.Org, value: org }],
  };
  let transactionResults;
  try {
    transactionResults = await session.withTransaction(async () => {
      const orgFilter: Filter<OrgEntity> = {
        id: org,
      };
      const orgUpdate: UpdateFilter<OrgEntity> = {
        $inc: { totalQuestions: 1 },
      };

      await collections.orgs.updateOne(orgFilter, orgUpdate, { session });

      await collections.questions.insertOne(newQuestion, { session });
      await session.commitTransaction();
    });
  } catch (error) {
    const msg = 'An error ocurred creating that question';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  } finally {
    await session.endSession();
  }
  return res.status(201).json({ message: 'Question created!', question: newQuestion });
};
