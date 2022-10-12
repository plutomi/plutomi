import { GetCommandInput, GetCommand } from '@aws-sdk/lib-dynamodb';

import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { env } from '../../env';
import { DynamoUser } from '../../types/dynamo';

interface GetUserByIdInput {
  userId: string;
}

export const getUserById = async (
  props: GetUserByIdInput,
): Promise<[DynamoUser, null] | [null, any]> => {
  const { userId } = props;
  const params: GetCommandInput = {
    TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
    Key: {
      PK: `${Entities.USER}#${userId}`,
      SK: Entities.USER,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoUser, null];
  } catch (error) {
    return [null, error];
  }
};
