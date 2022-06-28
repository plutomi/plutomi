import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';

import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoUser } from '../../types/dynamo';

interface GetUsersInOrgInput {
  orgId: string;
  /**
   * Optional limit to only return a certain number of users
   */
  limit?: number;
}

export const getUsersInOrg = async (
  props: GetUsersInOrgInput,
): Promise<[DynamoUser[], null] | [null, any]> => {
  const { orgId, limit } = props;
  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :GSI1PK',
    ExpressionAttributeValues: {
      ':GSI1PK': `${Entities.ORG}#${orgId}#${Entities.USER}S`,
    },
  }; // TODO query until all results are returned

  if (limit) {
    params.Limit = limit;
  }

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items as DynamoUser[], null];
  } catch (error) {
    return [null, error];
  }
};
