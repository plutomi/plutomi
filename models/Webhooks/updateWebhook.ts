/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-const */
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { APIUpdateWebhookOptions } from '../../Controllers/Webhooks/updateWebhook';
import { env } from '../../env';
import { DynamoWebhook } from '../../types/dynamo';
import { createDynamoUpdateExpression } from '../../utils/createDynamoUpdateExpression';

export interface UpdateWebhookInput extends Pick<DynamoWebhook, 'orgId' | 'webhookId'> {
  updatedValues: APIUpdateWebhookOptions;
}

export const updateWebhook = async (props: UpdateWebhookInput): Promise<[null, any]> => {
  const { orgId, webhookId, updatedValues } = props;

  const { allUpdateExpressions, allAttributeValues } = createDynamoUpdateExpression({
    updatedValues,
  });

  const params = {
    Key: {
      PK: `${Entities.ORG}#${orgId}#${Entities.WEBHOOK}#${webhookId}`,
      SK: Entities.WEBHOOK,
    },
    UpdateExpression: `SET ${allUpdateExpressions.join(', ')}`,
    ExpressionAttributeValues: allAttributeValues,
    TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
    ConditionExpression: 'attribute_exists(PK)',
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return [null, null];
  } catch (error) {
    console.error(error);
    return [null, error];
  }
};
