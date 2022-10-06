import {
  TransactWriteCommand,
  TransactWriteCommandInput,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities, NO_STAGE } from '../../Config';
import { APIUpdateStageOptions } from '../../Controllers/Stages/updateStage';
import { DynamoStage } from '../../types/dynamo';
import { createDynamoUpdateExpression } from '../../utils/createDynamoUpdateExpression';

export interface UpdateStageInput
  extends Pick<DynamoStage, 'orgId' | 'stageId' | 'openingId' | 'nextStageId' | 'previousStageId'> {
  updatedValues: APIUpdateStageOptions;
}

export const updateStage = async (props: UpdateStageInput): Promise<[null, null] | [null, any]> => {
  const {
    orgId,
    stageId,
    updatedValues,
    openingId,
    nextStageId: oldNextStageId,
    previousStageId: oldPreviousStageId,
  } = props;

  const { allUpdateExpressions, allAttributeValues } = createDynamoUpdateExpression({
    updatedValues,
  });

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        Update: {
          Key: {
            PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}`,
            SK: Entities.STAGE,
          },
          UpdateExpression: `SET ${allUpdateExpressions.join(', ')}`,
          ExpressionAttributeValues: allAttributeValues,
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: 'attribute_exists(PK)',
        },
      },
    ],
  };

  const newNextStageExists = updatedValues.nextStageId !== NO_STAGE;
  const newPreviousStageExists = updatedValues.previousStageId !== NO_STAGE;

  if (newNextStageExists) {
    if (updatedValues.nextStageId === oldPreviousStageId) {
      // Swapped places
      transactParams.TransactItems.push({
        Update: {
          Key: {
            PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldPreviousStageId}`,
            SK: Entities.STAGE,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression: 'SET previousStageId = :previousStageId, nextStageId = :nextStageId',
          ExpressionAttributeValues: {
            ':previousStageId': stageId,
            ':nextStageId': oldNextStageId,
          },
        },
      });
    }
  }

  if (newPreviousStageExists) {
    if (updatedValues.previousStageId === oldNextStageId) {
      // Swapped places
      transactParams.TransactItems.push({
        Update: {
          Key: {
            PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldNextStageId}`,
            SK: Entities.STAGE,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression: 'SET previousStageId = :previousStageId, nextStageId = :nextStageId',
          ExpressionAttributeValues: {
            ':previousStageId': oldPreviousStageId,
            ':nextStageId': stageId,
          },
        },
      });
    }
  }
  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
