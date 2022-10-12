import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { env } from '../../env';
import { DynamoOrg, DynamoOrgInvite } from '../../types/dynamo';

type GetInvitesForOrgInput = Pick<DynamoOrg, 'orgId'>;

export const getInvitesForOrg = async (
  props: GetInvitesForOrgInput,
): Promise<[DynamoOrgInvite[], null] | [null, any]> => {
  const { orgId } = props;
  const params: QueryCommandInput = {
    TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,

    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :GSI1PK',
    ExpressionAttributeValues: {
      ':GSI1PK': `${Entities.ORG}#${orgId}#${Entities.ORG_INVITE}S`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items as DynamoOrgInvite[], null];
  } catch (error) {
    return [null, error];
  }
};
