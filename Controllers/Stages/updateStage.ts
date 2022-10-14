import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import { DynamoStage } from '../../types/dynamo';
import * as CreateError from '../../utils/createError';
import { DB } from '../../models';
import { Stage } from '../../entities';
import { IndexedEntities } from '../../types/main';
import { findInTargetArray } from '../../utils/findInTargetArray';

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

  const { user, entityManager } = req;
  const { openingId, stageId } = req.params;

  const orgId = findInTargetArray({
    entity: IndexedEntities.Org,
    targetArray: user.target,
  });

  let stage: Stage;
  try {
    await entityManager.findOne(Stage, {
      id: stageId,
      $and: [
        { target: { id: openingId, type: IndexedEntities.Opening } },
        { target: { id: orgId, type: IndexedEntities.Org } },
      ],
    });
  } catch (error) {
    const message = 'An error ocurred retrieving stage info';
    console.error(message, error);
    return res.status(500).json({ message, error });
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

    stage.questionOrder = req.body.questionOrder;
  }

  if (req.body.GSI1SK) {
    stage.name = req.body.GSI1SK;
  }

  try {
    await entityManager.flush();
    return res.status(200).json({ message: 'Stage updated', stage });
  } catch (error) {
    const message = 'An error ocurred updating that stage';
    console.error(error, message);
    return res.status(500).json({ message, error });
  }
};
