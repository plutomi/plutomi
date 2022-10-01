import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoStage } from '../../types/dynamo';
import * as Time from '../../utils/time';
interface DeleteStageInput extends Pick<DynamoStage, 'orgId' | 'stageId' | 'openingId'> {
  updateOpening: boolean;
}

export const deleteStage = async (props: DeleteStageInput): Promise<[null, null] | [null, any]> => {
  // TODO check if stage is empty of applicants first ---> Delete children machine should take care of this now
  // Double // TODO - webhooks should delete applicants inside?
  const { orgId, stageId, openingId, updateOpening } = props;
  const now = Time.currentISO();
  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Delete stage
        Delete: {
          Key: {
            PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}`,
            SK: Entities.STAGE,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: 'attribute_exists(PK)',
        },
      },
    ],
  };

  if (updateOpening) {
    transactParams.TransactItems.push({
      // Decrement the totalStages
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}`,
          SK: Entities.OPENING,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
        UpdateExpression: `SET totalStages = totalStages - :value, updatedAt = :updatedAt`,
        ExpressionAttributeValues: {
          ':value': 1,
          ':updatedAt': now,
        },
      },
    });

    // TODO TODO TODO this needs to update the adjacent stages, if any
  }
  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
