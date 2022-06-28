import { GetCommandInput, GetCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoOrgInvite } from '../../types/dynamo';

type GetOrgInviteInput = {
  userId: string;
  inviteId: string;
};

export const getInvite = async (
  props: GetOrgInviteInput,
): Promise<[DynamoOrgInvite, null] | [null, any]> => {
  const { userId, inviteId } = props;
  const params: GetCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    Key: {
      PK: `${Entities.USER}#${userId}`,
      SK: `${Entities.ORG_INVITE}#${inviteId}`,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoOrgInvite, null];
  } catch (error) {
    return [null, error];
  }
};
