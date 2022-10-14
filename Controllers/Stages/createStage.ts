import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import * as CreateError from '../../utils/createError';
import { DynamoStage } from '../../types/dynamo';
import { DB } from '../../models';
import { Opening, Stage } from '../../entities';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { IndexedEntities } from '../../types/main';

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
    position: Joi.number() // TODO currently not in place
      .min(0)
      .max(LIMITS.MAX_CHILD_ITEM_LIMIT - 1),
  },
}).options(JOI_SETTINGS);

export const createStage = async (req: Request, res: Response) => {
  const { user, entityManager } = req;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { GSI1SK, openingId, position } = req.body;

  const orgId = findInTargetArray({ entity: IndexedEntities.Org, targetArray: user.target });
  console.log(`CREATING STAGE BODY`, req.body);
  let opening: Opening;

  try {
    opening = await entityManager.findOne(Opening, {
      id: openingId,
      target: [{ id: orgId, type: IndexedEntities.Org }],
    });
  } catch (error) {
    const message = 'An error ocurred retrieving opening info';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  if (!opening) {
    return res.status(404).json({ message: 'Opening does not exist' });
  }

  // Get current last stage

  let lastStage: Stage;
  {
    $and: [
      { target: { id: undefined, type: 'PreviousStage' } },
      { target: { id: undefined, type: 'NextStage' } },
    ];
  }
  try {
    lastStage = await entityManager.findOne(Stage, {
      $and: [
        {
          target: [{ id: orgId, type: IndexedEntities.Org }],
        },
        { target: [{ id: openingId, type: IndexedEntities.Opening }] },
        // Get the last stage
        { target: [{ id: undefined, type: IndexedEntities.NextStage }] },
      ],
    });
  } catch (error) {
    const message = 'An error ocurred retrieving the last stage in the opening';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  // TODO move this inside a transaction

  opening.totalStages = opening.totalStages += 1;

  let newStage = new Stage({
    name: GSI1SK,
    target: [
      { id: opening.id, type: IndexedEntities.Opening },
      { id: orgId, type: IndexedEntities.Org },
      { id: undefined, type: IndexedEntities.PreviousStage },
      { id: undefined, type: IndexedEntities.NextStage },
    ],
  });

  // Set the last stage's nextStage to be our newly created stage
  lastStage.target = [...lastStage.target, { id: newStage.id, type: IndexedEntities.NextStage }];

  // TODO wrap all of this in a transaction
  try {
    entityManager.persist([opening, newStage, lastStage]);
    await entityManager.flush();
  } catch (error) {
    const message = 'An error ocurred creating that stage';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }
  return res.status(201).json({ message: 'Stage created!' });
};
