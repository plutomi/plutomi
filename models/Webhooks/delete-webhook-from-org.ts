import { TransactWriteCommand, TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DeleteWebhookFromOrgInput } from '../../types/main';

export default async function DeleteWebhookFromOrg(
  props: DeleteWebhookFromOrgInput,
): Promise<[null, SdkError]> {
  const { orgId, webhookId } = props;

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Delete webhook from org
        Delete: {
          Key: {
            PK: `${Entities.ORG}#${orgId}#${Entities.WEBHOOK}#${webhookId}`,
            SK: Entities.WEBHOOK,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: 'attribute_exists(PK)',
        },
      },
      {
        // Decrement the org's totalWebhooks
        Update: {
          Key: {
            PK: `${Entities.ORG}#${orgId}`,
            SK: Entities.ORG,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression: 'SET totalWebhooks = totalWebhooks - :value',
          ExpressionAttributeValues: {
            ':value': 1,
          },
        },
      },
    ],
  };
  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
