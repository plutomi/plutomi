import { Request, Response } from 'express';
import Joi from 'joi';
import { DEFAULTS, JOI_GLOBAL_FORBIDDEN, JOI_SETTINGS, LIMITS } from '../../Config';
import * as Stages from '../../models/Stages';
import { DynamoStage } from '../../types/dynamo';
import * as CreateError from '../../utils/createError';

export interface APIUpdateStageOptions
  extends Partial<Pick<DynamoStage, 'GSI1SK' | 'questionOrder'>> {
  [key: string]: any;
}

const JOI_FORBIDDEN_STAGE = Joi.object({
  ...JOI_GLOBAL_FORBIDDEN,
  openingId: Joi.any().forbidden(),
  stageId: Joi.any().forbidden(),
  GSI1PK: Joi.any().forbidden(),
  questionOrder: Joi.array().items(Joi.string()).optional(),
  totalApplicants: Joi.any().forbidden(),
  GSI1SK: Joi.string().optional().max(LIMITS.MAX_STAGE_NAME_LENGTH),
});

const schema = Joi.object({
  body: JOI_FORBIDDEN_STAGE,
}).options(JOI_SETTINGS);

const main = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { session } = res.locals;
  const { openingId, stageId } = req.params;

  const [stage, stageError] = await Stages.GetStageById({
    openingId,
    stageId,
    orgId: session.orgId,
  });

  if (stageError) {
    const { status, body } = CreateError.SDK(
      stageError,
      'An error ocurred retrieving your stage info',
    );
    return res.status(status).json(body);
  }
  if (req.body.questionOrder) {
    if (req.body.questionOrder.length != stage.questionOrder.length) {
      return res.status(403).json({
        message:
          'You cannot add / delete questions this way, please use the proper API methods for those actions',
      });
    }

    // Check if the IDs have been modified
    const containsAll = stage.questionOrder.every((questionId) => {
      return req.body.questionOrder.includes(questionId);
    });

    if (!containsAll) {
      return res.status(400).json({
        message:
          "The questionIds in the 'questionOrder' property differ from the ones in the stage, please check your request and try again.",
      });
    }
  }

  const [updatedStage, updateError] = await Stages.UpdateStage({
    orgId: session.orgId,
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
export default main;
