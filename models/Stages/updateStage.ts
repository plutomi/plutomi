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

  // Many scenarios are now possible
  // https://github.com/plutomi/plutomi/pull/738
  /**
   * Scenario 1
   * Starting at the beginning, moved to the end, only two stages
   *
   *     OLD --- NEW
   * Stage 1 --- Stage 2
   * Stage 2 --- Stage 1 <-- Moved
   */
  if (startedAtTheBeginning && endedAtTheEnd && oldNextStageId === updatedValues.previousStageId) {
    transactParams.TransactItems.push({
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${updatedValues.previousStageId}`,
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

  /**
   * Scenario 2
   * Starting at the beginning, moved to the end, more than two stages
   *
   * OLD --- NEW
   *
   * Stage 1 --- Stage 2
   * Stage 2 --- Stage 3
   * Stage 3 --- Stage 1 <-- Moved
   */

  if (startedAtTheBeginning && endedAtTheEnd && oldNextStageId === updatedValues.previousStageId) {
    transactParams.TransactItems.push({
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldNextStageId}`,
          SK: Entities.STAGE,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
        UpdateExpression: 'SET previousStageId = :previousStageId',
        ExpressionAttributeValues: {
          ':previousStageId': oldPreviousStageId,
        },
      },
    });

    transactParams.TransactItems.push({
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

  /**
   * Scenario 3
   * Starting at the beginning, moved to the middle, more than two stages
   *
   * OLD --- NEW
   *
   * Stage 1 --- Stage 2
   * Stage 2 --- Stage 3
   * Stage 3 --- Stage 1 <-- Moved
   * Stage 4 --- Stage 4
   */

  if (
    startedAtTheBeginning &&
    !endedAtTheEnd &&
    updatedValues.nextStageId !== oldPreviousStageId &&
    updatedValues.previousStageId !== oldNextStageId
  ) {
    transactParams.TransactItems.push({
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${updatedValues.nextStageId}`,
          SK: Entities.STAGE,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
        UpdateExpression: 'SET previousStageId = :previousStageId',
        ExpressionAttributeValues: {
          ':previousStageId': stageId,
        },
      },
    });

    transactParams.TransactItems.push({
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

  /**
   * Scenario 4
   * Starting at the end, moved to the beginning, only two stages
   *
   * OLD --- NEW
   *
   * Stage 1 --- Stage 2 <-- Moved
   * Stage 2 --- Stage 1
   */

  if (startedAtTheEnd && endedAtTheBeginning && oldPreviousStageId === updatedValues.nextStageId) {
    transactParams.TransactItems.push({
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${updatedValues.nextStageId}`,
          SK: Entities.STAGE,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
        UpdateExpression: 'SET previousStageId = :previousStageId',
        ExpressionAttributeValues: {
          ':previousStageId': stageId,
          ':nextStageId': oldNextStageId,
        },
      },
    });
  }

  if (startedAtTheEnd && endedAtTheBeginning && oldPreviousStageId !== updatedValues.nextStageId) {
    transactParams.TransactItems.push({
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldPreviousStageId}`,
          SK: Entities.STAGE,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
        UpdateExpression: 'SET nextStageId = :nextStageId',
        ExpressionAttributeValues: {
          ':nextStageId': oldNextStageId,
        },
      },
    });

    transactParams.TransactItems.push({
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${updatedValues.nextStageId}`,
          SK: Entities.STAGE,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
        UpdateExpression: 'SET previousStageId = :previousStageId',
        ExpressionAttributeValues: {
          ':previousStageId': stageId,
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
