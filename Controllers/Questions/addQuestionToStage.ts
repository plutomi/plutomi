import { Request, Response } from 'express';
import Joi from 'joi';
import { Filter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import { StageEntity, StageQuestionItemEntity } from '../../models';
import { findInTargetArray } from '../../utils';
import { collections } from '../../utils/connectToDatabase';

const schema = Joi.object({
  body: {
    questionId: Joi.string(),
    /**
     * 0 based index on where should the question should be added
     * If no position is provided, question is added to the end of the stage
     */
    position: Joi.number()
      .min(0)
      .max(LIMITS.MAX_CHILD_ITEM_LIMIT - 1),
  },
}).options(JOI_SETTINGS);

export const addQuestionToStage = async (req: Request, res: Response) => {
  const { user } = req;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    return res.status(400).json({ message: 'An error ocurred', error });
  }

  // TODO types, and allow position
  const { questionId, position }: { questionId: string; position?: number } = req.body;
  const { stageId } = req.params; // TODO update route to not include openingId

  const orgId = findInTargetArray(IndexableProperties.Org, user);
  const stageFilter: Filter<StageEntity> = {
    id: stageId,
    target: [
      {
        property: IndexableProperties.Org,
        value: orgId,
      },
    ],
  };

  let stage: StageEntity | undefined;
  try {
    stage = (await collections.stages.findOne(stageFilter)) as StageEntity;
  } catch (error) {
    const msg = 'An error ocurred finding the info for that stage';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  }

  if (!stage) {
    return res.status(404).json({ message: 'Stage not found!' });
  }

  // Get the current last question

  let currentLastStageQuestionItem: StageQuestionItemEntity;

  const currentLastStageQuestionItemFilter: Filter<StageQuestionItemEntity> = {
    $and: [
      {
        target: { property: IndexableProperties.Org, value: orgId },
      },
      { target: { property: IndexableProperties.Stage, value: stageId } },
      { target: { property: IndexableProperties.NextQuestion, value: null } },
    ],
  };

  try {
    currentLastStageQuestionItem = (await collections.stageQuestionItem.findOne(
      currentLastStageQuestionItemFilter,
    )) as StageQuestionItemEntity;
  } catch (error) {
    const message = 'An error ocurred retrieving the last question in the stage';
    console.error(message, error);
    return res.status(500).json(message);
  }

  // const [question, getQuestionError] = await DB.Questions.getQuestion({
  //   orgId: user.orgId,
  //   questionId,
  // });

  // if (getQuestionError) {
  //   const { status, body } = CreateError.SDK(
  //     getQuestionError,
  //     'An error ocurred retrieving info for that question',
  //   );
  //   return res.status(status).json(body);
  // }

  // if (!question) {
  //   return res.status(404).json({
  //     message: `A question with the ID of '${questionId}' does not exist in this org`,
  //   });
  // }

  // const [stage, stageError] = await DB.Stages.getStage({
  //   openingId,
  //   stageId,
  //   orgId: user.orgId,
  // });

  // if (stageError) {
  //   const { status, body } = CreateError.SDK(stageError, 'Unable to retrieve stage info');

  //   return res.status(status).json(body);
  // }

  // if (!stage) {
  //   return res.status(404).json({ message: 'Stage does not exist' });
  // }

  // // Block questions from being added to a stage if it already exists in the stage
  // if (stage.questionOrder.includes(questionId)) {
  //   return res.status(409).json({
  //     message: `A question with the ID of '${questionId}' already exists in this stage. Please use a different question ID or delete the old one.`,
  //   });
  // }

  // // Update the stage with the new questionOrder
  // const questionOrder = getNewChildItemOrder(questionId, stage.questionOrder, position);

  // const [stageUpdated, stageUpdatedError] = await DB.Questions.addQuestionToStage({
  //   openingId,
  //   stageId,
  //   orgId: user.orgId,
  //   questionId,
  //   questionOrder,
  // });

  // if (stageUpdatedError) {
  //   const { status, body } = CreateError.SDK(stageError, 'An error ocurred updating your stage');
  //   return res.status(status).json(body);
  // }

  // return res.status(201).json({ message: 'Question added to stage!' });
};
