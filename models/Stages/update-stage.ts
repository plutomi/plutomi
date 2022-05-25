import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from '../../Config';
import { UpdateStageInput } from '../../types/main';

export default async function UpdateStage(
  props: UpdateStageInput,
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, stageId, newValues, openingId } = props;

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

  const params = {
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
      SK: ENTITY_TYPES.STAGE,
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
}
