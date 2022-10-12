import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { env } from '../../env';
import { DynamoOrgInvite, DynamoUser } from '../../types/dynamo';

type GetInvitesForUserInput = Pick<DynamoUser, 'userId'>;

export const getInvitesForUser = async (
  props: GetInvitesForUserInput,
): Promise<[DynamoOrgInvite[], null] | [null, Error]> => {
  const { userId } = props;
  const params: QueryCommandInput = {
    TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
    KeyConditionExpression: 'PK = :PK AND begins_with(SK, :SK)',
    ExpressionAttributeValues: {
      ':PK': `${Entities.USER}#${userId}`,
      ':SK': Entities.ORG_INVITE,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items as DynamoOrgInvite[], null];
  } catch (error) {
    return [null, error];
  }
};
