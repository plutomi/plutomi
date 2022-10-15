import { UpdateCommandInput, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { env } from '../../env';
import { createDynamoUpdateExpression } from '../../utils/createDynamoUpdateExpression';

export const updateOpening = async (props): Promise<[null, null] | [null, any]> => {
  const { orgId, openingId, updatedValues } = props;
  const { allUpdateExpressions, allAttributeValues } = createDynamoUpdateExpression({
    updatedValues,
  });

  const params: UpdateCommandInput = {
    Key: {
      PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}`,
      SK: Entities.OPENING,
    },
    UpdateExpression: `SET ${allUpdateExpressions.join(', ')}`,
    ExpressionAttributeValues: allAttributeValues,
    TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
    ConditionExpression: 'attribute_exists(PK)',
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
