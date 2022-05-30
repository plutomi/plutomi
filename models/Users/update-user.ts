import { UpdateCommandInput, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoUser } from '../../types/dynamo';
import { UpdateUserInput } from '../../types/main';

export default async function UpdateUser(
  props: UpdateUserInput,
): Promise<[DynamoUser, null] | [null, SdkError]> {
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
    return [updatedUser.Attributes as DynamoUser, null];
  } catch (error) {
    return [null, error];
  }
}
