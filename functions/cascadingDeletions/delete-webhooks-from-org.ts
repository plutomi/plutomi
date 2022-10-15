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
*  const ORG_HAS_WEBHOOKS = sfn.Condition.numberGreaterThan('$.detail.OldImage.totalWebhooks', 0);
 *     const definition = new Choice(this, 'WhichEntity?')
      .when(
        ORG_DELETED,
        new sfn.Parallel(this, 'OrgCleanup')
          .branch(
            new Choice(this, 'OrgHasQuestions')
              .when(
                ORG_HAS_WEBHOOKS,
                new tasks.LambdaInvoke(this, 'DeleteWebhooksFromOrg', {
                  lambdaFunction: deleteWebhooksFromOrg,
                }),
              )
              .otherwise(new sfn.Succeed(this, "Org doesn't have webhooks")),
          )
 */
export async function main(event: EventBridgeEvent<'stream', CustomEventBridgeEvent>) {
  console.log('Incoming event: ', JSON.stringify(event));
  const deletedEntity = event.detail.OldImage;

  // TODO temporarily disabled
  // if (deletedEntity.entityType === Entities.ORG && deletedEntity.totalWebhooks > 0) {
  //   console.log('Org has questions, deleting...');

  //   const [allWebhooks, allWebhooksError] = await DB.Webhooks.getWebhooksInOrg({
  //     orgId: event.detail.orgId,
  //   });

  //   if (allWebhooksError) {
  //     console.error(
  //       'An error ocurred retrieving webhooks in an org to delete...',
  //       allWebhooksError,
  //     );
  //     return;
  //   }

  //   try {
  //     await Promise.all(
  //       allWebhooks.map(async (webhook) =>
  //         DB.Webhooks.deleteWebhook({
  //           orgId: event.detail.orgId,
  //           webhookId: webhook.webhookId,
  //           updateOrg: false,
  //         }),
  //       ),
  //     );
  //     console.log('All webhooks deleted!');
  //   } catch (error) {
  //     console.log('An error ocurred deleting webhooks in org', error);
  //   }
  // }
}
