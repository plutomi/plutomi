import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoStage } from '../../types/dynamo';

interface DeleteStageInput extends Pick<DynamoStage, 'orgId' | 'stageId' | 'openingId'> {
  deleteIndex: number;
}

export const deleteStage = async (
  props: DeleteStageInput,
): Promise<[undefined, null] | [null, any]> => {
  // TODO check if stage is empty of applicants first ---> Delete children machine should take care of this now
  // Double // TODO - webhooks should delete applicants inside?
  const { orgId, stageId, openingId, deleteIndex } = props;
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

      // Remove the stage from the opening and decrement the stage count on the opening
      {
        Update: {
          Key: {
            PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}`,
            SK: Entities.OPENING,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression: `REMOVE stageOrder[${deleteIndex}] SET totalStages = totalStages - :value`,
          ExpressionAttributeValues: {
            ':value': 1,
          },
        },
      },
    ],
  };

  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
