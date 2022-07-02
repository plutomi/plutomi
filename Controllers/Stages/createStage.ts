import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import * as CreateError from '../../utils/createError';
import { DynamoStage } from '../../types/dynamo';
import { DB } from '../../models';

export interface APICreateStageOptions extends Required<Pick<DynamoStage, 'openingId' | 'GSI1SK'>> {
  /**
   * 0 based index on where the newly created stage should be placed
   */
  position?: number;
}
const schema = Joi.object({
  body: {
    // Stage name
    GSI1SK: Joi.string().max(LIMITS.MAX_STAGE_NAME_LENGTH),
    openingId: Joi.string(),
    /**
     * 0 based index on where should the stage be added
     * If no position is provided, stage is added to the end of the opening
     */
    position: Joi.number()
      .min(0)
      .max(LIMITS.MAX_CHILD_ITEM_LIMIT - 1),
  },
}).options(JOI_SETTINGS);

export const createStage = async (req: Request, res: Response) => {
  const { user } = req;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { GSI1SK, openingId, position } = req.body;

  console.log(`CREATING STAGE BODY`, req.body);
  const [opening, openingError] = await DB.Openings.getOpening({
    openingId,
    orgId: user.orgId,
  });

  if (openingError) {
    const { status, body } = CreateError.SDK(openingError, 'Unable to retrieve opening info');
    return res.status(status).json(body);
  }

  if (!opening) {
    return res.status(404).json({ message: 'Opening does not exist' });
  }

  // Create the stage and update the stage order, model will handle where to place it
  const [created, stageError] = await DB.Stages.createStage({
    orgId: user.orgId,
    GSI1SK,
    openingId,
    position,
    stageOrder: opening.stageOrder,
  });

  if (stageError) {
    const { status, body } = CreateError.SDK(stageError, 'An error ocurred creating your stage');
    return res.status(status).json(body);
  }

  return res.status(201).json({ message: 'Stage created!' });
};
