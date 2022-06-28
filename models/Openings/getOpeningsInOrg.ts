import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities, OpeningState } from '../../Config';
import { DynamoOpening } from '../../types/dynamo';

interface GetOpeningsInOrgInput extends Pick<DynamoOpening, 'orgId'> {
  GSI1SK?: OpeningState;
}

/**
 * Retrieves openings in an org. Provide a `GSI1SK` to filter on public or private
 * @param props
 * @returns
 */
export const getOpeningsInOrg = async (
  props: GetOpeningsInOrgInput,
): Promise<[DynamoOpening[], null] | [null, any]> => {
  const { orgId, GSI1SK } = props;
  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :GSI1PK',
    ExpressionAttributeValues: {
      ':GSI1PK': `${Entities.ORG}#${orgId}#${Entities.OPENING}S`,
    },
  };

  // Sort private or public. Optional. Retrieves all by default
  if (GSI1SK) {
    params.KeyConditionExpression += ' AND GSI1SK = :GSI1SK';
    params.ExpressionAttributeValues[':GSI1SK'] = GSI1SK;
  }

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items as DynamoOpening[], null];
  } catch (error) {
    return [null, error];
  }
};
