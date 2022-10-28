import { Request, Response } from 'express';
import Joi from 'joi';
import { Filter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import { StageEntity } from '../../models';
import { OpeningEntity } from '../../models/Opening';
import { collections } from '../../utils/connectToDatabase';
import * as CreateError from '../../utils/createError';
// import { DynamoStage } from '../../types/dynamo';
import { findInTargetArray } from '../../utils/findInTargetArray';

// export interface APICreateStageOptions extends Required<Pick<DynamoStage, 'openingId' | 'GSI1SK'>> {
//   /**
//    * 0 based index on where the newly created stage should be placed
//    */
//   position?: number;

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
  const { user } = req;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { GSI1SK, openingId, position } = req.body;

  const orgId = findInTargetArray(IndexableProperties.Org, user);
  console.log(`CREATING STAGE BODY`, req.body);
  let opening: OpeningEntity;

  const openingFilter: Filter<OpeningEntity> = {
    $and: [
      { target: { property: IndexableProperties.Org, value: orgId } },
      { target: { property: IndexableProperties.Id, value: openingId } },
    ],
  };
  try {
    opening = (await collections.openings.findOne(openingFilter)) as OpeningEntity;
  } catch (error) {
    const message = 'An error ocurred retrieving opening info';
    console.error(message, error);
    return res.status(500).json({ message });
  }

  if (!opening) {
    return res.status(404).json({ message: 'Opening does not exist' });
  }

  // Get current last stage
  let currentLastStage: StageEntity;

  const currentLastStageFilter: Filter<StageEntity> = {
    $and: [
      {
        target: { property: IndexableProperties.Org, value: orgId },
      },
      { target: { property: IndexableProperties.Opening, value: openingId } },
      { target: { property: IndexableProperties.NextStage, value: undefined } },
    ],
  };
  try {
    currentLastStage = (await collections.stages.findOne(currentLastStageFilter)) as StageEntity;
  } catch (error) {
    const message = 'An error ocurred retrieving the last stage in the opening';
    console.error(message, error);
    return res.status(500).json({ message });
  }

  // TODO move this inside a transaction

  opening.totalStages = opening.totalStages += 1;

  entityManager.persist(opening);

  let newStage = new Stage({
    name: GSI1SK,
    target: [
      { id: opening.id, type: IdxTypes.Opening },
      { id: orgId, type: IdxTypes.Org },
      { id: undefined, type: IdxTypes.PreviousStage },
      { id: undefined, type: IdxTypes.NextStage },
    ],
  });

  try {
    console.log(`Creating new stage`, newStage);

    await entityManager.persistAndFlush(newStage); // TODO check if we can remove and do this all at once
    console.log('New stage created!');
  } catch (error) {
    const message = 'An error ocurred creating that stage';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }

  console.log(`New stage that was created`, newStage);
  if (currentLastStage) {
    // Set the last stage's nextStage to be our newly created stage
    const indexOfNextStage = currentLastStage.target.findIndex(
      (item) => item.type === IdxTypes.NextStage,
    );
    // Cannot use .id as it returns undefined after creating a new entity
    currentLastStage.target[indexOfNextStage] = {
      id: newStage._id.toString(),
      type: IdxTypes.NextStage,
    };

    const indexOfPreviousStage = newStage.target.findIndex(
      (item) => item.type === IdxTypes.PreviousStage,
    );

    // Set our new stage's previousStage to be the last stage
    newStage.target[indexOfPreviousStage] = {
      id: currentLastStage.id,
      type: IdxTypes.PreviousStage,
    };

    entityManager.persist(currentLastStage);
  }

  entityManager.persist(newStage);

  // TODO wrap all of this in a transaction
  try {
    await entityManager.flush();
  } catch (error) {
    const message = 'An error ocurred updating opening stages';
    console.error(message, error);
    return res.status(500).json({ message, error });
  }
  return res.status(201).json({ message: 'Stage created!' });
};
