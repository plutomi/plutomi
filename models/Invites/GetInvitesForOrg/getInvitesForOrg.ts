import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../../Config';
import { DynamoOrg, DynamoOrgInvite } from '../../../types/dynamo';

type GetInvitesForOrgInput = Pick<DynamoOrg, 'orgId'>;

export const getInvitesForOrg = async (
  props: GetInvitesForOrgInput,
): Promise<[DynamoOrgInvite[], undefined] | [undefined, SdkError]> => {
  const { orgId } = props;
  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :GSI1PK',
    ExpressionAttributeValues: {
      ':GSI1PK': `${Entities.ORG}#${orgId}#${Entities.ORG_INVITE}S`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items as DynamoOrgInvite[], undefined];
  } catch (error) {
    return [undefined, error];
  }
};
