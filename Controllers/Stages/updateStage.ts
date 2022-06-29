import { Request, Response } from 'express';
import Joi from 'joi';
import {  JOI_SETTINGS, LIMITS } from '../../Config';
import { DynamoStage } from '../../types/dynamo';
import * as CreateError from '../../utils/createError';
import { DB } from '../../models';

export interface APIUpdateStageOptions
  extends Partial<Pick<DynamoStage, 'GSI1SK' | 'questionOrder'>> {
  [key: string]: any;
}

const JOI_FORBIDDEN_STAGE = Joi.object({
  openingId: Joi.any().forbidden(),
  stageId: Joi.any().forbidden(),
  GSI1PK: Joi.any().forbidden(),
  questionOrder: Joi.array().items(Joi.string()).optional(),
  totalApplicants: Joi.any().forbidden(),
  totalQuestions: Joi.any().forbidden(),
  GSI1SK: Joi.string().optional().max(LIMITS.MAX_STAGE_NAME_LENGTH),
});

const schema = Joi.object({
  body: JOI_FORBIDDEN_STAGE,
}).options(JOI_SETTINGS);

export const updateStage = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { user } = req;
  const { openingId, stageId } = req.params;

  const [stage, stageError] = await DB.Stages.getStage({
    openingId,
    stageId,
    orgId: user.orgId,
  });

  if (stageError) {
    const { status, body } = CreateError.SDK(
      stageError,
      'An error ocurred retrieving your stage info',
    );
    return res.status(status).json(body);
  }

  if (!stage) {
    return res.status(404).json({ message: 'Stage not found' });
  }

  /**
   * If a user is attempting to update the order of the questions
   * but the length differs
   */
  if (req.body.questionOrder) {
    if (req.body.questionOrder.length !== stage.questionOrder.length) {
      return res.status(403).json({
        message:
          'You cannot add / delete questions this way, please use the proper API methods for those actions',
      });
    }

    // Check if the IDs have been modified
    const containsAll = stage.questionOrder.every((questionId) =>
      req.body.questionOrder.includes(questionId),
    );

    if (!containsAll) {
      return res.status(400).json({
        message:
          "The questionIds in the 'questionOrder' property differ from the ones in the stage, please check your request and try again.",
      });
    }
  }

  const [updatedStage, updateError] = await DB.Stages.updateStage({
    orgId: user.orgId,
    openingId,
    stageId,
    newValues: req.body,
  });

  if (updateError) {
    const { status, body } = CreateError.SDK(updateError, 'An error ocurred updating this stage');
    return res.status(status).json(body);
  }

  return res.status(200).json({
    message: 'Stage updated!',
  });
};
