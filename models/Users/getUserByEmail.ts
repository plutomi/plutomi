import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';

import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoUser } from '../../types/dynamo';

interface GetUserByEmailInput {
  email: string;
}

export const getUserByEmail = async (
  props: GetUserByEmailInput,
): Promise<[DynamoUser, null] | [null, any]> => {
  const { email } = props;
  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    IndexName: 'GSI2',
    KeyConditionExpression: 'GSI2PK = :GSI2PK AND GSI2SK = :GSI2SK',
    ExpressionAttributeValues: {
      ':GSI2PK': email.toLowerCase().trim(),
      ':GSI2SK': Entities.USER,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items[0] as DynamoUser, null];
    // TODO are we sure the first item will be the user? Switch this to .find
  } catch (error) {
    return [null, error];
  }
};
