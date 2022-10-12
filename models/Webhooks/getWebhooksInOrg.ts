import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';

import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { env } from '../../env';
import { DynamoWebhook } from '../../types/dynamo';

type GetWebhooksInOrgInput = Pick<DynamoWebhook, 'orgId'>;

export const getWebhooksInOrg = async (
  props: GetWebhooksInOrgInput,
): Promise<[DynamoWebhook[], any]> => {
  const { orgId } = props;
  const params: QueryCommandInput = {
    TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :GSI1PK',
    ExpressionAttributeValues: {
      ':GSI1PK': `${Entities.ORG}#${orgId}#${Entities.WEBHOOK}S`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items as DynamoWebhook[], null];
  } catch (error) {
    return [null, error];
  }
};
