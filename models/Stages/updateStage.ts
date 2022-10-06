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

  const movedToBeginning = updatedValues.previousStageId === NO_STAGE;
  const movedToEnd = updatedValues.nextStageId === NO_STAGE;
  const movedToMiddle =
    updatedValues.nextStageId !== NO_STAGE && updatedValues.previousStageId !== NO_STAGE;

  const wasInBeginning = oldPreviousStageId === NO_STAGE;
  const wasAtEnd = oldNextStageId === NO_STAGE;

  const onlyTwoItems =
    updatedValues.previousStageId === oldNextStageId ||
    updatedValues.nextStageId === oldPreviousStageId;

  if (movedToEnd && wasInBeginning && onlyTwoItems) {
    /**
     * OLD  --- NEW
     *
     * Stage 1 --- Stage 2
     * Stage 2 --- Stage 1 <-- Moved
     */
    transactParams.TransactItems.push({
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${updatedValues.previousStageId}`,
          SK: Entities.STAGE,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
        UpdateExpression: 'SET previousStageId = :previousStageId, nextStageId = :nextStageId',
        ExpressionAttributeValues: {
          ':previousStageId': NO_STAGE,
          ':nextStageId': stageId,
        },
      },
    });
  }

  if (movedToEnd && wasInBeginning && !onlyTwoItems) {
    /**
     * OLD  --- NEW
     *
     * Stage 1 --- Stage 2
     * Stage 2 --- Stage 3
     * Stage 3 --- Stage 1 <-- Moved
     */
    transactParams.TransactItems.push({
      // Update Stage 2
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldNextStageId}`,
          SK: Entities.STAGE,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
        UpdateExpression: 'SET previousStageId = :previousStageId, nextStageId = :nextStageId',
        ExpressionAttributeValues: {
          ':previousStageId': NO_STAGE,
          ':nextStageId': updatedValues.previousStageId,
        },
      },
    });

    transactParams.TransactItems.push({
      // Update Stage 3
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${updatedValues.previousStageId}`,
          SK: Entities.STAGE,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
        UpdateExpression: 'SET nextStageId = :nextStageId',
        ExpressionAttributeValues: {
          ':nextStageId': stageId,
        },
      },
    });
  }

  if (movedToEnd && !wasInBeginning && !onlyTwoItems) {
    /**
     * OLD  --- NEW
     *
     * Stage 2 --- Stage 2
     * Stage 1 --- Stage 3
     * Stage 3 --- Stage 1 <-- Moved
     */

    transactParams.TransactItems.push({
      // Update stage 2
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldPreviousStageId}`,
          SK: Entities.STAGE,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
        UpdateExpression: 'SET previousStageId = :previousStageId, nextStageId = :nextStageId',
        ExpressionAttributeValues: {
          ':previousStageId': NO_STAGE,
          ':nextStageId': updatedValues.previousStageId,
        },
      },
    });
  }

  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
