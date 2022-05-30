import { UpdateCommandInput, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoUser } from '../../types/dynamo';

export interface UpdateUserInput extends Pick<DynamoUser, 'userId'> {
  newValues: { [key: string]: any };
}

// TODO new udpate method https://github.com/plutomi/plutomi/issues/594
export const updateUser = async (
  props: UpdateUserInput,
): Promise<[DynamoUser, undefined] | [undefined, SdkError]> => {
  const { userId, newValues } = props;

  // Build update expression
  const allUpdateExpressions: string[] = [];
  const allAttributeValues: { [key: string]: string } = {};

  // https://github.com/plutomi/plutomi/issues/594
  // eslint-disable-next-line no-restricted-syntax
  for (const property of Object.keys(newValues)) {
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = newValues[property];
  }

  const params: UpdateCommandInput = {
    Key: {
      PK: `${Entities.USER}#${userId}`,
      SK: Entities.USER,
    },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: `SET ${allUpdateExpressions.join(', ')}`,
    ExpressionAttributeValues: allAttributeValues,
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    ConditionExpression: 'attribute_exists(PK)',
  };
  try {
    const updatedUser = await Dynamo.send(new UpdateCommand(params));
    return [updatedUser.Attributes as DynamoUser, undefined];
  } catch (error) {
    return [undefined, error];
  }
};
