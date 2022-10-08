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
  const startedInTheMiddle = !startedAtTheBeginning && !startedAtTheEnd;

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
        UpdateExpression: `SET nextStageId = :nextStageId, previousStageId = :previousStageId`,
        ExpressionAttributeValues: {
          ':nextStageId': stageId,
          ':previousStageId': oldPreviousStageId,
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

  if (startedAtTheBeginning && !endedAtTheEnd && updatedValues.previousStageId === oldNextStageId) {
    transactParams.TransactItems.push({
      Update: {
        // Stage 2
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${updatedValues.previousStageId}`,
          SK: Entities.STAGE,
        },
        UpdateExpression: `SET nextStageId = :nextStageId, previousStageId = :previousStageId`,
        ExpressionAttributeValues: {
          ':nextStageId': stageId,
          ':previousStageId': oldPreviousStageId,
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
  /**
   * Scenario 4
   * Starting at the beginning, moved to the middle (not at the end), movement was greater than one stage
   *
   *     OLD --- NEW
   * Stage 1 --- Stage 2
   * Stage 2 --- Stage 3
   * Stage 3 --- Stage 1 <-- Moved
   * Stage 4 --- Stage 4
   */

  if (startedAtTheBeginning && !endedAtTheEnd && updatedValues.previousStageId !== oldNextStageId) {
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

    transactParams.TransactItems.push({
      Update: {
        // Stage 4
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
   * Scenario 5
   * Starting at the end, only two stages, moved to the end
   *
   *     OLD --- NEW
   * Stage 1 --- Stage 2 <-- Moved
   * Stage 2 --- Stage 1
   */

  if (startedAtTheEnd && endedAtTheBeginning && oldPreviousStageId === updatedValues.nextStageId) {
    transactParams.TransactItems.push({
      Update: {
        // Stage 1
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${updatedValues.nextStageId}`,
          SK: Entities.STAGE,
        },
        UpdateExpression: `SET nextStageId = :nextStageId, previousStageId = :previousStageId`,
        ExpressionAttributeValues: {
          ':nextStageId': oldNextStageId,
          ':previousStageId': stageId,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
      },
    });
  }

  /**
   * Scenario 6
   * Starting at the end, more than two stages, only a one stage move (swap)
   *
   *     OLD --- NEW
   * Stage 1 --- Stage 1
   * Stage 2 --- Stage 3<-- Moved
   * Stage 3 --- Stage 2
   */

  if (startedAtTheEnd && !endedAtTheBeginning && updatedValues.nextStageId === oldPreviousStageId) {
    transactParams.TransactItems.push({
      Update: {
        // Stage 1
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
        // Stage 2
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${updatedValues.nextStageId}`,
          SK: Entities.STAGE,
        },
        UpdateExpression: `SET nextStageId = :nextStageId, previousStageId = :previousStageId`,
        ExpressionAttributeValues: {
          ':nextStageId': oldNextStageId,
          ':previousStageId': stageId,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
      },
    });
  }

  /**
   * Scenario 7
   * Starting at the end, more than two stages, moved to the beginning
   *
   *     OLD --- NEW
   * Stage 1 --- Stage 3 <-- Moved
   * Stage 2 --- Stage 1
   * Stage 3 --- Stage 2
   */

  if (startedAtTheEnd && endedAtTheBeginning && updatedValues.nextStageId !== oldPreviousStageId) {
    transactParams.TransactItems.push({
      Update: {
        // Stage 1
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

    transactParams.TransactItems.push({
      Update: {
        // Stage 2
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldPreviousStageId}`,
          SK: Entities.STAGE,
        },
        UpdateExpression: `SET nextStageId = :nextStageId`,
        ExpressionAttributeValues: {
          ':nextStageId': oldNextStageId,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
      },
    });
  }

  /**
   * Scenario 8
   * Starting at the end, more than two stages, moved to the middle
   *
   *     OLD --- NEW
   * Stage 1 --- Stage 1
   * Stage 2 --- Stage 4 <-- Moved
   * Stage 3 --- Stage 2
   * Stage 4 --- Stage 3
   */

  if (startedAtTheEnd && !endedAtTheBeginning && updatedValues.nextStageId !== oldPreviousStageId) {
    transactParams.TransactItems.push({
      Update: {
        // Stage 1
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
        // Stage 2
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

    transactParams.TransactItems.push({
      Update: {
        // Stage 3
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldPreviousStageId}`,
          SK: Entities.STAGE,
        },
        UpdateExpression: `SET nextStageId = :nextStageId`,
        ExpressionAttributeValues: {
          ':nextStageId': oldNextStageId,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
      },
    });
  }

  /**
   * Scenario 9
   * Starting in the middle, moved to the beginning, one stage move up (swap)
   *
   *     OLD --- NEW
   * Stage 1 --- Stage 2 <-- Moved
   * Stage 2 --- Stage 1
   * Stage 3 --- Stage 3
   */

  if (
    startedInTheMiddle &&
    endedAtTheBeginning &&
    oldPreviousStageId === updatedValues.nextStageId
  ) {
    transactParams.TransactItems.push({
      Update: {
        // Stage 1
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${updatedValues.nextStageId}`,
          SK: Entities.STAGE,
        },
        UpdateExpression: `SET nextStageId = :nextStageId, previousStageId = :previousStageId`,
        ExpressionAttributeValues: {
          ':nextStageId': oldNextStageId,
          ':previousStageId': stageId,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
      },
    });

    transactParams.TransactItems.push({
      Update: {
        // Stage 3
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
  }

  /**
   * Scenario 10
   * Starting in the middle, moved to the end, one stage move down (swap)
   *
   *     OLD --- NEW
   * Stage 1 --- Stage 1
   * Stage 2 --- Stage 3
   * Stage 3 --- Stage 2 <-- Moved
   */

  if (startedInTheMiddle && endedAtTheEnd && oldNextStageId === updatedValues.previousStageId) {
    transactParams.TransactItems.push({
      Update: {
        // Stage 1
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldPreviousStageId}`,
          SK: Entities.STAGE,
        },
        UpdateExpression: `SET nextStageId = :nextStageId`,
        ExpressionAttributeValues: {
          ':nextStageId': oldNextStageId,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
      },
    });

    transactParams.TransactItems.push({
      Update: {
        // Stage 3
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldNextStageId}`,
          SK: Entities.STAGE,
        },
        UpdateExpression: `SET nextStageId = :nextStageId, previousStageId = :previousStageId`,
        ExpressionAttributeValues: {
          ':nextStageId': stageId,
          ':previousStageId': oldPreviousStageId,
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
