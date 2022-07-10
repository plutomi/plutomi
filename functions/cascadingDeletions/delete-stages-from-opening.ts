import { EventBridgeEvent } from 'aws-lambda';
import axios from 'axios';
import { Entities } from '../../Config';
import { DB } from '../../models';
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
  const deletedEntity = event.detail.OldImage;

  if (deletedEntity.entityType === Entities.OPENING && deletedEntity.totalStages > 0) {
    console.log('Opening has stages, attempting to delete...');
    const stagesToDelete = deletedEntity.stageOrder;

    try {
      await Promise.all(
        stagesToDelete.map(async (stage, index) =>
          DB.Stages.deleteStage({
            orgId: deletedEntity.orgId,
            openingId: deletedEntity.openingId,
            stageId: stage,
            deleteIndex: index,
            updateOpening: false,
          }),
        ),
      );
      console.log('All stages deleted!');
    } catch (error) {
      console.log('An error ocurred deleting stages', error);
    }
  }
}
