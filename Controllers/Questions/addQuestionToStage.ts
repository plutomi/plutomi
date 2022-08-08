import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import { Question } from '../../entities/Question';
import { DB } from '../../models';
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
      .max(LIMITS.MAX_CHILD_ITEM_LIMIT - 1),
  },
}).options(JOI_SETTINGS);

export const addQuestionToStage = async (req: Request, res: Response) => {
  const { user } = req;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  // TODO types
  const { questionId, position }: { questionId: string; position?: number } = req.body;
  const { openingId, stageId } = req.params;

  try {
    const question = await Question.findById({
      _id: questionId,
      orgId: user.org,
    });

    if (!question) {
      return res.status(404).json({
        message: `A question with the ID of '${questionId}' does not exist in this org`,
      });
    }

    
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving question info' });
  }

  const [stage, stageError] = await DB.Stages.getStage({
    openingId,
    stageId,
    orgId: user.org,
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
    orgId: user.org,
    questionId,
    questionOrder,
  });

  if (stageUpdatedError) {
    const { status, body } = CreateError.SDK(stageError, 'An error ocurred updating your stage');
    return res.status(status).json(body);
  }

  return res.status(201).json({ message: 'Question added to stage!' });
};
