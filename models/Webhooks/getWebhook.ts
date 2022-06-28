import { GetCommandInput, GetCommand } from '@aws-sdk/lib-dynamodb';

import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoWebhook } from '../../types/dynamo';

type GetWebhookByIdInput = Pick<DynamoWebhook, 'orgId' | 'webhookId'>;

export const getWebhook = async (props: GetWebhookByIdInput): Promise<[DynamoWebhook, any]> => {
  const { orgId, webhookId } = props;
  const params: GetCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    Key: {
      PK: `${Entities.ORG}#${orgId}#${Entities.WEBHOOK}#${webhookId}`,
      SK: Entities.WEBHOOK,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoWebhook, null];
  } catch (error) {
    return [null, error];
  }
};
