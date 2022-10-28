import { Request, Response } from 'express';
import { Filter, UpdateFilter } from 'mongodb';
import { IndexableProperties } from '../../@types/indexableProperties';
import { OrgEntity, StageEntity, StageTargetArray } from '../../models';
import { OpeningEntity } from '../../models/Opening';
import { collections, mongoClient } from '../../utils/connectToDatabase';
// import { Opening, Stage } from '../../entities';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const deleteStage = async (req: Request, res: Response) => {
  const { user } = req;
  const { openingId, stageId } = req.params;
  const orgId = findInTargetArray(IndexableProperties.Org, user);

  console.log(`Incoming opening ID`, openingId);
  let opening: OpeningEntity;

  const openingFilter: Filter<OpeningEntity> = {
    $and: [
      { target: { property: IndexableProperties.Id, value: openingId } },
      { target: { property: IndexableProperties.Org, value: orgId } },
    ],
  };
  try {
    opening = (await collections.openings.findOne(openingFilter)) as OpeningEntity;
  } catch (error) {
    const message = 'An error ocurred finding opening info';
    console.error(message, error);
    return res.status(500).json(message);
  }

  if (!opening) {
    return res.status(404).json({
      message: `Hmm... it appears that the opening with ID of '${openingId}' no longer exists`,
    });
  }

  let ourStage: StageEntity;

  const stageFilter: Filter<StageEntity> = {
    $and: [
      { target: { property: IndexableProperties.Opening, value: openingId } },
      { target: { property: IndexableProperties.Org, value: orgId } },
      { target: { property: IndexableProperties.Id, value: stageId } },
    ],
  };
  try {
    ourStage = (await collections.stages.findOne(stageFilter)) as StageEntity;
  } catch (error) {
    const message = 'An error ocurred finding the stage info';
    console.error(message, error);
    return res.status(500).json(message);
  }

  if (!ourStage) {
    return res.status(404).json({
      message: `Hmm... it appears that the stage with ID of '${stageId}' no longer exists`,
    });
  }

  console.log('Getting old previous stage');
  const oldPreviousStageId = findInTargetArray(IndexableProperties.PreviousStage, ourStage);

  console.log('Getting old next stage');

  const oldNextStageId = findInTargetArray(IndexableProperties.NextStage, ourStage);

  console.log('Got both');
  let oldPreviousStage: StageEntity;
  let oldNextStage: StageEntity;

  console.log('Starting transaction');
  const session = mongoClient.startSession();

  let transactionResults;

  console.log('Removing the stage!');
  console.log(stageFilter);
  try {
    // TODO these can be done in parallel

    transactionResults = await session.withTransaction(async () => {
      // Update the old previous stage, if it existed
      if (oldPreviousStageId) {
        const oldPreviousStageFilter: Filter<StageEntity> = {
          $and: [
            { target: { property: IndexableProperties.Opening, value: openingId } },
            { target: { property: IndexableProperties.Org, value: orgId } },
            { target: { property: IndexableProperties.Id, value: oldPreviousStageId } },
          ],
        };

        oldPreviousStage = (await collections.stages.findOne(oldPreviousStageFilter, {
          session,
        })) as StageEntity;

        const oldPreviousStageNextStageIndex = oldPreviousStage.target.findIndex(
          (item) => item.property === IndexableProperties.NextStage,
        );

        // TODO can these be more efficient? Just updating the specific item in the array

        oldPreviousStage.target[oldPreviousStageNextStageIndex] = {
          property: IndexableProperties.NextStage,
          value: oldNextStageId ? oldNextStageId : undefined,
        };

        console.log('Attempting to update old previous stage');
        await collections.stages.updateOne(
          oldPreviousStageFilter,
          {
            $set: {
              target: oldPreviousStage.target,
            },
          },
          { session },
        );
        console.log('Updated old previous stage');
      }

      // Update the old next stage, if it existed
      if (oldNextStageId) {
        const oldNextStageFilter: Filter<StageEntity> = {
          $and: [
            { target: { property: IndexableProperties.Opening, value: openingId } },
            { target: { property: IndexableProperties.Org, value: orgId } },
            { target: { property: IndexableProperties.Id, value: oldNextStageId } },
          ],
        };

        oldNextStage = (await collections.stages.findOne(oldNextStageFilter, {
          session,
        })) as StageEntity;

        const oldNextStagePreviousStageIndex = oldNextStage.target.findIndex(
          (item) => item.property === IndexableProperties.PreviousStage,
        );

        oldNextStage.target[oldNextStagePreviousStageIndex] = {
          property: IndexableProperties.PreviousStage,
          value: oldPreviousStage ? oldPreviousStageId : undefined,
        };

        await collections.stages.updateOne(
          oldNextStageFilter,
          {
            $set: {
              target: oldNextStage.target,
            },
          },
          { session },
        );
        console.log('Updated old next stage');
      }

      // Decrement the totalStages count on the org
      const orgFilter: Filter<OrgEntity> = {
        target: { property: IndexableProperties.Id, value: orgId },
      };
      const orgUpdateFilter: UpdateFilter<OrgEntity> = {
        $inc: { totalStages: -1 },
      };
      console.log('Updating org!');
      await collections.orgs.updateOne(orgFilter, orgUpdateFilter, { session });
      console.log('ORG UPDATED');

      // Decrement the totalStages count on the opening
      const openingUpdateFilter: UpdateFilter<OrgEntity> = {
        $inc: { totalStages: -1 },
      };
      console.log('Updating opening');
      await collections.openings.updateOne(openingFilter, openingUpdateFilter, { session });
      console.log('Opening Updated');

      // Remove the stage
      await collections.stages.deleteOne(stageFilter, { session });

      await session.commitTransaction();
    });
  } catch (error) {
    const msg = 'Error ocurred deleting that stage';
    console.error(msg, error);
    return res.status(500).json({ message: msg });
  } finally {
    await session.endSession();
  }

  return res.status(200).json({ message: 'Stage deleted!' });
};
