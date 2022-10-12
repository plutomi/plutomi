import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { env } from '../../env';
import { DynamoOpening } from '../../types/dynamo';
import * as Time from '../../utils/time';

interface DeleteOpeningInput extends Pick<DynamoOpening, 'orgId' | 'openingId'> {
  /**
   * Whether to decrement the totalOpenings on the org
   */
  updateOrg: boolean;
}

export const deleteOpening = async (
  props: DeleteOpeningInput,
): Promise<[null, null] | [null, any]> => {
  const { orgId, openingId, updateOrg } = props;

  const now = Time.currentISO();
  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete the opening
          Delete: {
            Key: {
              PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}`,
              SK: Entities.OPENING,
            },
            TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
            ConditionExpression: 'attribute_exists(PK)',
          },
        },
      ],
    };

    if (updateOrg) {
      transactParams.TransactItems.push({
        // Decrement the org's total openings
        Update: {
          Key: {
            PK: `${Entities.ORG}#${orgId}`,
            SK: Entities.ORG,
          },
          TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression: 'SET totalOpenings = totalOpenings - :value, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':value': 1,
            ':updatedAt': now,
          },
          ConditionExpression: 'attribute_exists(PK)',
        },
      });
    }
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
