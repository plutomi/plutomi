import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { IUser } from '../../entities/User';
import { DynamoOrgInvite } from '../../types/dynamo';

type GetInvitesForUserInput = Pick<IUser, '_id'>;

export const getInvitesForUser = async (
  props: GetInvitesForUserInput,
): Promise<[DynamoOrgInvite[], null] | [null, Error]> => {
  const { _id } = props;
  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    KeyConditionExpression: 'PK = :PK AND begins_with(SK, :SK)',
    ExpressionAttributeValues: {
      ':PK': `${Entities.USER}#${_id}`,
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
