import { UpdateCommandInput, UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { APIUpdateUserOptions } from '../../Controllers/Users/updateUser';
import { env } from '../../env';
import { DynamoUser } from '../../types/dynamo';
import { createDynamoUpdateExpression } from '../../utils/createDynamoUpdateExpression';

export interface UpdateUserInput extends Pick<DynamoUser, 'userId'> {
  updatedValues: APIUpdateUserOptions;
}

export const updateUser = async (
  props: UpdateUserInput,
): Promise<[DynamoUser, null] | [null, any]> => {
  const { userId, updatedValues } = props;

  const { allUpdateExpressions, allAttributeValues } = createDynamoUpdateExpression({
    updatedValues,
  });

  const params: UpdateCommandInput = {
    Key: {
      PK: `${Entities.USER}#${userId}`,
      SK: Entities.USER,
    },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: `SET ${allUpdateExpressions.join(', ')}`,
    ExpressionAttributeValues: allAttributeValues,
    TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
    ConditionExpression: 'attribute_exists(PK)',
  };
  try {
    const updatedUser = await Dynamo.send(new UpdateCommand(params));
    return [updatedUser.Attributes as DynamoUser, null];
  } catch (error) {
    return [null, error];
  }
};
