import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { nanoid } from 'nanoid';

import { Dynamo } from '../../awsClients/ddbDocClient';
import { Entities, DYNAMO_TABLE_NAME } from '../../Config';
import { DynamoWebhook } from '../../types/dynamo';
import * as Time from '../../utils/time';
import TagGenerator from '../../utils/tagGenerator';
import { env } from '../../env';

type CreateWebhookInput = Pick<
  DynamoWebhook,
  'webhookUrl' | 'orgId' | 'description' | 'webhookName'
>;

export const createWebhook = async (props: CreateWebhookInput): Promise<[DynamoWebhook, any]> => {
  const { orgId, webhookName, webhookUrl, description } = props;
  const webhookId = TagGenerator({
    value: nanoid(15),
    joinString: '_',
  });

  const now = Time.currentISO();
  const newWebhook: DynamoWebhook = {
    PK: `${Entities.ORG}#${orgId}#${Entities.WEBHOOK}#${webhookId}`,
    SK: Entities.WEBHOOK,
    entityType: Entities.WEBHOOK,
    createdAt: now,
    updatedAt: now,
    webhookId,
    webhookName,
    orgId,
    webhookUrl,
    GSI1PK: `${Entities.ORG}#${orgId}#${Entities.WEBHOOK}S`,
    GSI1SK: now,
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
          TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
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
          TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression:
            'SET totalWebhooks = if_not_exists(totalWebhooks, :zero) + :value, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':zero': 0,
            ':value': 1,
            ':updatedAt': now,
          },
        },
      },
    ],
  };

  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [newWebhook, null];
  } catch (error) {
    return [null, error];
  }
};
