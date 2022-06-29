import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import { DynamoStage } from '../../types/dynamo';
import * as CreateError from '../../utils/createError';
import { DB } from '../../models';

export interface APIUpdateStageOptions
  extends Partial<Pick<DynamoStage, 'GSI1SK' | 'questionOrder'>> {}

const schema = Joi.object({
  questionOrder: Joi.array().items(Joi.string()),
  GSI1SK: Joi.string().max(LIMITS.MAX_STAGE_NAME_LENGTH),
}).options(JOI_SETTINGS);

export const updateStage = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  let updatedValues: APIUpdateStageOptions = {};
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

    updatedValues.questionOrder = req.body.questionOrder;
  }

  if (req.body.GSI1SK) {
    updatedValues.GSI1SK = req.body.GSI1SK;
  }

  const [updatedStage, updateError] = await DB.Stages.updateStage({
    orgId: user.orgId,
    openingId,
    stageId,
    updatedValues,
  });

  if (updateError) {
    const { status, body } = CreateError.SDK(updateError, 'An error ocurred updating this stage');
    return res.status(status).json(body);
  }

  return res.status(200).json({
    message: 'Stage updated!',
  });
};
