import { UpdateCommandInput, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { APIUpdateOpeningOptions } from '../../Controllers/Openings/updateOpening';
import { DynamoOpening } from '../../types/dynamo';

export interface UpdateOpeningInput extends Pick<DynamoOpening, 'orgId' | 'openingId'> {
  updatedValues: APIUpdateOpeningOptions;
}

export const updateOpening = async (
  props: UpdateOpeningInput,
): Promise<[null, null] | [null, any]> => {
  const { orgId, openingId } = props;

  // TODO convert this to a function
  // Build update expression
  const allUpdateExpressions: string[] = [];
  const allAttributeValues: { [key: string]: string } = {};

  for (const property of Object.keys(props.updatedValues)) {
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = props.updatedValues[property];
  }

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
