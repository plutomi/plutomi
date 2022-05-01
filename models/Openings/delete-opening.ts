import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../AWSClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from '../../Config';
import { DeleteOpeningInput } from '../../types/main';

export default async function DeleteOpening(
  props: DeleteOpeningInput,
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, openingId } = props;

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete the opening
          Delete: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
              SK: ENTITY_TYPES.OPENING,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

            ConditionExpression: 'attribute_exists(PK)',
          },
        },
        {
          // Decrement the org's total openings
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}`,
              SK: ENTITY_TYPES.ORG,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

            UpdateExpression: 'SET totalOpenings = totalOpenings - :value',
            ExpressionAttributeValues: {
              ':value': 1,
            },
            ConditionExpression: 'attribute_exists(PK)',
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
