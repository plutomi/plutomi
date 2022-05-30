import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import DB from '../../models';
import * as CreateError from '../../utils/createError';
import getNewChildItemOrder from '../../utils/getNewChildItemOrder';

const schema = Joi.object({
  body: {
    questionId: Joi.string(),
    /**
     * 0 based index on where should the question should be added
     * If no position is provided, question is added to the end of the stage
     */
    position: Joi.number()
      .min(0)
      .max(LIMITS.MAX_CHILD_ITEM_LIMIT - 1)
      .optional(),
  },
}).options(JOI_SETTINGS);

export const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  // TODO types
  const { questionId, position }: { questionId: string; position?: number } = req.body;
  const { openingId, stageId } = req.params;

  const [question, getQuestionError] = await DB.Questions.getQuestion({
    orgId: session.orgId,
    questionId,
  });

  if (getQuestionError) {
    const { status, body } = CreateError.SDK(
      getQuestionError,
      'An error ocurred retrieving info for that question',
    );
    return res.status(status).json(body);
  }

  if (!question) {
    return res.status(404).json({
      message: `A question with the ID of '${questionId}' does not exist in this org`,
    });
  }

  const [stage, stageError] = await DB.Stages.getStage({
    openingId,
    stageId,
    orgId: session.orgId,
  });

  if (stageError) {
    const { status, body } = CreateError.SDK(stageError, 'Unable to retrieve stage info');

    return res.status(status).json(body);
  }

  if (!stage) {
    return res.status(404).json({ message: 'Stage does not exist' });
  }

  // Block questions from being added to a stage if it already exists in the stage
  if (stage.questionOrder.includes(questionId)) {
    return res.status(409).json({
      message: `A question with the ID of '${questionId}' already exists in this stage. Please use a different question ID or delete the old one.`,
    });
  }

  // Update the stage with the new questionOrder
  const questionOrder = getNewChildItemOrder(questionId, stage.questionOrder, position);

  const [stageUpdated, stageUpdatedError] = await DB.Questions.addQuestionToStage({
    openingId,
    stageId,
    orgId: session.orgId,
    questionId,
    questionOrder,
  });

  if (stageUpdatedError) {
    const { status, body } = CreateError.SDK(stageError, 'An error ocurred updating your stage');
    return res.status(status).json(body);
  }

  return res.status(201).json({ message: 'Question added to stage!' });
};
