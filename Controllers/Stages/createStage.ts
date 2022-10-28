import { Request, Response } from 'express';
import Joi from 'joi';
import { Filter, UpdateFilter } from 'mongodb';
import { nanoid } from 'nanoid';
import { IndexableProperties } from '../../@types/indexableProperties';
import { JOI_SETTINGS, LIMITS } from '../../Config';
import { OrgEntity, StageEntity } from '../../models';
import { OpeningEntity } from '../../models/Opening';
import { collections, mongoClient } from '../../utils/connectToDatabase';
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
    return res.status(500).json(message);
  }

  const newStageId = nanoid(50);
  const now = new Date();
  const newStage: StageEntity = {
    createdAt: now,
    updatedAt: now,
    totalQuestions: 0,
    totalApplicants: 0,
    name: GSI1SK, // TODO update this
    target: [
      { property: IndexableProperties.Id, value: newStageId },
      { property: IndexableProperties.Org, value: orgId },
      { property: IndexableProperties.Opening, value: openingId },
      {
        property: IndexableProperties.PreviousStage,
        value: currentLastStage
          ? findInTargetArray(IndexableProperties.Id, currentLastStage)
          : undefined,
      }, // Add to the end by default, TODO allow position property
      { property: IndexableProperties.NextStage, value: undefined },
    ],
  };

  const session = mongoClient.startSession();

  let transactionResults;

  try {
    transactionResults = await session.withTransaction(async () => {
      // 1. Create the new stage
      await collections.stages.insertOne(newStage, { session });

      // 2. Increment the opening's totalStage count
      const openingUpdateFilter: UpdateFilter<OpeningEntity> = {
        $inc: { totalStages: 1 },
      };
      await collections.openings.updateOne(openingFilter, openingUpdateFilter, { session });

      // 3. Increment the org's total stage count

      const orgFilter: Filter<OrgEntity> = {
        $and: [{ target: { property: IndexableProperties.Id, value: orgId } }],
      };

      const orgUpdateFilter: UpdateFilter<OrgEntity> = {
        $inc: { totalStages: 1 },
      };

      await collections.orgs.updateOne(orgFilter, orgUpdateFilter, { session });
      // 4. Update the current last stage, if it exists, to have the ID of our new stage

      if (currentLastStage) {
        const lastStageUpdateFilter: UpdateFilter<StageEntity> = {
          $set: { 'target.$.value': newStageId },
        };

        await collections.stages.updateOne(currentLastStageFilter, lastStageUpdateFilter, {
          session,
        });
      }

      await session.commitTransaction();
    });
  } catch (error) {
    const message = 'An error ocurred creating that stage';
    console.error(message, error);
    return res.status(500).json(message);
  } finally {
    await session.endSession();
  }

  return res.status(201).json({ message: 'Stage created!', stage: newStage });
};
