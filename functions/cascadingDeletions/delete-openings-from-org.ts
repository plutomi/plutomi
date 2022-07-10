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
 * const ORG_DELETED = sfn.Condition.stringEquals('$.detail.entityType', Entities.ORG);
*  const ORG_HAS_OPENINGS = sfn.Condition.numberGreaterThan('$.detail.OldImage.totalOpenings', 0);
 *     const definition = new Choice(this, 'WhichEntity?')
      .when(
        ORG_DELETED,
        new sfn.Parallel(this, 'OrgCleanup')
          .branch(
            new Choice(this, 'OrgHasOpenings')
              .when(
                ORG_HAS_OPENINGS,
                new tasks.LambdaInvoke(this, 'DeleteOpeningsFromOrg', {
                  lambdaFunction: deleteOpeningsFromOrgFunction,
                }),
              )
              .otherwise(new sfn.Succeed(this, "Org doesn't have openings")),
          )
 */
export async function main(event: EventBridgeEvent<'stream', CustomEventBridgeEvent>) {
  console.log('Incoming event: ', JSON.stringify(event));
  const deletedEntity = event.detail.OldImage;

  if (deletedEntity.entityType === Entities.ORG && deletedEntity.totalOpenings > 0) {
    console.log('Org has openings, deleting...');

    const [allOpenings, allOpeningsError] = await DB.Openings.getOpeningsInOrg({
      orgId: event.detail.orgId,
    });

    if (allOpeningsError) {
      console.error(
        'An error ocurred retrieving openings in an org to delete...',
        allOpeningsError,
      );
      return;
    }

    try {
      await Promise.all(
        allOpenings.map(async (opening) =>
          DB.Openings.deleteOpening({
            orgId: deletedEntity.orgId,
            openingId: opening.openingId,
            updateOrg: false,
          }),
        ),
      );
      console.log('All openings deleted!');
    } catch (error) {
      console.log('An error ocurred deleting openings in org', error);
    }
  }
}
