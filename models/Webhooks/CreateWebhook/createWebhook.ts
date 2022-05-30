import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { nanoid } from 'nanoid';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../../awsClients/ddbDocClient';
import { Entities, DYNAMO_TABLE_NAME } from '../../../Config';
import { DynamoWebhook } from '../../../types/dynamo';
import * as Time from '../../../utils/time';

type CreateWebhookInput = Pick<
  DynamoWebhook,
  'webhookUrl' | 'orgId' | 'description' | 'webhookName'
>;

export const createWebhook = async (
  props: CreateWebhookInput,
): Promise<[DynamoWebhook, SdkError]> => {
  const { orgId, webhookName, webhookUrl, description } = props;
  const webhookId = nanoid(15);
  const newWebhook: DynamoWebhook = {
    PK: `${Entities.ORG}#${orgId}#${Entities.WEBHOOK}#${webhookId}`,
    SK: Entities.WEBHOOK,
    entityType: Entities.WEBHOOK,
    createdAt: Time.currentISO(),
    webhookId,
    webhookName,
    orgId,
    webhookUrl,
    GSI1PK: `${Entities.ORG}#${orgId}#${Entities.WEBHOOK}S`,
    GSI1SK: Time.currentISO(),
  };

  if (description) {
    newWebhook.description = description;
  }

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Create the webhook
        Put: {
          Item: newWebhook,
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: 'attribute_not_exists(PK)',
        },
      },
      {
        // Increment the org's total webhooks
        Update: {
          Key: {
            PK: `${Entities.ORG}#${orgId}`,
            SK: Entities.ORG,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression: 'SET totalWebhooks = if_not_exists(totalWebhooks, :zero) + :value',
          ExpressionAttributeValues: {
            ':zero': 0,
            ':value': 1,
          },
        },
      },
    ],
  };

  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [newWebhook, undefined];
  } catch (error) {
    return [undefined, error];
  }
};
