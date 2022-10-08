import {
  TransactWriteCommand,
  TransactWriteCommandInput,
  UpdateCommand,
  UpdateCommandInput,
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

  const updateOperations: UpdateCommandInput[] = [];

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      // Update our stage with new values
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

  const startedAtTheBeginning = oldPreviousStageId === NO_STAGE;
  const startedAtTheEnd = oldNextStageId === NO_STAGE;
  const endedAtTheBeginning = updatedValues.previousStageId === NO_STAGE;
  const endedAtTheEnd = updatedValues.nextStageId === NO_STAGE;

  let response = [null, null];
  let errors = [];

  // Many scenarios are now possible
  // https://github.com/plutomi/plutomi/pull/738
  /**
   * Scenario 1
   * Starting at the beginning, only two stages, moved to the end
   *
   *     OLD --- NEW
   * Stage 1 --- Stage 2
   * Stage 2 --- Stage 1 <-- Moved
   */

  if (startedAtTheBeginning && endedAtTheEnd && oldNextStageId === updatedValues.previousStageId) {
    transactParams.TransactItems.push({
      Update: {
        // Stage 2
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${updatedValues.previousStageId}`,
          SK: Entities.STAGE,
        },
        UpdateExpression: `SET nextStageId = :nextStageId`,
        ExpressionAttributeValues: {
          ':nextStageId': stageId,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
      },
    });
  }

  /**
   * Scenario 2
   * Starting at the beginning, moved one stage down to the middle, not the end
   *
   *     OLD --- NEW
   * Stage 1 --- Stage 2
   * Stage 2 --- Stage 1 <-- Moved
   * Stage 3 --- Stage 3
   */

  if (
    startedAtTheBeginning &&
    updatedValues.previousStageId === oldNextStageId &&
    updatedValues.nextStageId !== NO_STAGE
  ) {
    transactParams.TransactItems.push({
      Update: {
        // Stage 2
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${updatedValues.previousStageId}`,
          SK: Entities.STAGE,
        },
        UpdateExpression: `SET nextStageId = :nextStageId`,
        ExpressionAttributeValues: {
          ':nextStageId': stageId,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
      },
    });

    transactParams.TransactItems.push({
      Update: {
        // Stage 3
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${updatedValues.nextStageId}`,
          SK: Entities.STAGE,
        },
        UpdateExpression: `SET previousStageId = :previousStageId`,
        ExpressionAttributeValues: {
          ':previousStageId': stageId,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
      },
    });
  }

  /**
   * Scenario 3
   * Starting at the beginning, moved to the end, more than one stage
   *
   *     OLD --- NEW
   * Stage 1 --- Stage 2
   * Stage 2 --- Stage 3
   * Stage 3 --- Stage 1 <-- Moved
   */

  if (startedAtTheBeginning && endedAtTheEnd && updatedValues.previousStageId !== oldNextStageId) {
    transactParams.TransactItems.push({
      Update: {
        // Stage 2
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldNextStageId}`,
          SK: Entities.STAGE,
        },
        UpdateExpression: `SET previousStageId = :previousStageId`,
        ExpressionAttributeValues: {
          ':previousStageId': oldPreviousStageId,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
      },
    });

    transactParams.TransactItems.push({
      Update: {
        // Stage 3
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${updatedValues.previousStageId}`,
          SK: Entities.STAGE,
        },
        UpdateExpression: `SET nextStageId = :nextStageId`,
        ExpressionAttributeValues: {
          ':nextStageId': stageId,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
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
