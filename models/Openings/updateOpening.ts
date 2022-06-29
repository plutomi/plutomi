import { UpdateCommandInput, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { APIUpdateOpeningOptions } from '../../Controllers/Openings/updateOpening';
import { DynamoOpening } from '../../types/dynamo';
import { createDynamoUpdateExpression } from '../../utils/createDynamoUpdateExpression';
export interface UpdateOpeningInput extends Pick<DynamoOpening, 'orgId' | 'openingId'> {
  updatedValues: APIUpdateOpeningOptions;
}

export const updateOpening = async (
  props: UpdateOpeningInput,
): Promise<[null, null] | [null, any]> => {
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
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    ConditionExpression: 'attribute_exists(PK)',
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
