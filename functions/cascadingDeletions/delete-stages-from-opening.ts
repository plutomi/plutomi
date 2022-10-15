import { EntityManager } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import { EventBridgeEvent } from 'aws-lambda';
import axios from 'axios';
import { Entities } from '../../Config';
import { Opening, Stage } from '../../entities';
import { DB } from '../../models';
import { IndexedEntities } from '../../types/main';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { getEntityManager } from '../../utils/getEntityManager';
import { CustomEventBridgeEvent } from '../stream-processor';

/**
 * ! NOTE !
 * This won't trigger unless the filter is set on the actual step function. Make sure it matches whenever you want this to trigger!
 * The `IF` checks in here are for *type safety* with `discriminated unions` and do not have any effect on whether this function is triggered or not!
 * 
 * This allows us to run functions in parallel if needed.
 * Example:
 * 
 * const OPENING_DELETED = sfn.Condition.stringEquals('$.entityType', Entities.OPENING);
 * const OPENING_HAS_STAGES = sfn.Condition.numberGreaterThan('$.detail.OldImage.totalStages', 0);
 *     const definition = new Choice(this, 'WhichEntity?')
      .when(
        OPENING_DELETED,
        new Choice(this, 'Does Opening have stages?')
          .when(OPENING_HAS_STAGES, GET_STAGES_IN_OPENING.next(CALL_THIS_FUNCTION!!!!!!!!!!!!!!!))
          .otherwise(new sfn.Succeed(this, "Opening doesn't have stages :)")),
      )
 */
export async function main(event: EventBridgeEvent<'stream', CustomEventBridgeEvent>) {
  console.log('Incoming event: ', JSON.stringify(event));
  const deletedEntity = event.detail.OldImage as Opening;
  const orgId = findInTargetArray({
    entity: IndexedEntities.Org,
    targetArray: deletedEntity.target,
  });
  const openingState = findInTargetArray({
    entity: IndexedEntities.OpeningState,
    targetArray: deletedEntity.target,
  });

  if (deletedEntity.totalStages > 0) {
    console.log('Opening has stages, attempting to delete...');

    let entityManager: EntityManager<MongoDriver>;
    try {
      console.log('Getting entity manager');
      entityManager = await getEntityManager();
      console.log('Got entity manager');
    } catch (error) {
      const message =
        'An error ocurred retrieving the entity manager in delete stages from opening function';
      console.log(message, error);
      return;
    }

    let stagesToDelete: Stage[];

    try {
      stagesToDelete = await entityManager.find(Stage, {
        $and: [
          { target: { id: orgId, type: IndexedEntities.Org } },
          { target: { id: deletedEntity.id, type: IndexedEntities.Opening } },
        ],
      });
    } catch (error) {
      const message = 'Error ocurred retrieving stages that we need to delete';
      console.error(message, error);
      return;
    }

    try {
      await Promise.all(
        stagesToDelete.map(async (stage) => await entityManager.removeAndFlush(stage)),
      );
      console.log('All stages deleted!');
    } catch (error) {
      console.log('An error ocurred deleting stages', error);
    }
  }
}
