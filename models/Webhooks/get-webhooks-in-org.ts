import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from '../../Config';
import { DynamoWebhook } from '../../types/dynamo';
import { GetWebhooksInOrgInput } from '../../types/main';

export default async function GetWebhooksInOrg(
  props: GetWebhooksInOrgInput,
): Promise<[DynamoWebhook[], SdkError]> {
  const { orgId } = props;
  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :GSI1PK',
    ExpressionAttributeValues: {
      ':GSI1PK': `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.WEBHOOK}S`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items as DynamoWebhook[], null];
  } catch (error) {
    return [null, error];
  }
}
