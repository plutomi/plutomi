import { TransactWriteCommand, TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { env } from '../../env';
import { DynamoWebhook } from '../../types/dynamo';
import * as Time from '../../utils/time';

interface DeleteWebhookFromOrgInput extends Pick<DynamoWebhook, 'webhookId' | 'orgId'> {
  /**
   * Whether to update the org's total webhooks count
   */
  updateOrg: boolean;
}
export const deleteWebhook = async (props: DeleteWebhookFromOrgInput): Promise<[null, any]> => {
  const { orgId, webhookId, updateOrg } = props;
  const now = Time.currentISO();
  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Delete webhook from org
        Delete: {
          Key: {
            PK: `${Entities.ORG}#${orgId}#${Entities.WEBHOOK}#${webhookId}`,
            SK: Entities.WEBHOOK,
          },
          TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: 'attribute_exists(PK)',
        },
      },
    ],
  };

  if (updateOrg) {
    transactParams.TransactItems.push({
      // Decrement the org's totalWebhooks
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}`,
          SK: Entities.ORG,
        },
        TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
        UpdateExpression: 'SET totalWebhooks = totalWebhooks - :value, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':value': 1,
          ':updatedAt': now,
        },
      },
    });
  }
  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
