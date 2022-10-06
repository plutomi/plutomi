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

  const thereIsANewNextStage = updatedValues.previousStageId !== NO_STAGE;
  const thereIsANewPreviousStage = updatedValues.nextStageId !== NO_STAGE;

  // If there is a new next stage, update that stage's previous stage ID to be of our stage
  // AND update the OLD next stage's previous stage to the OLD previous stage ID

  if (oldPreviousStageId === updatedValues.nextStageId) {
    /**
     *   Old         New
     *
     * Stage 1  --- Stage 2 <-- Moved
     * Stage 2  --- Stage 1 <-- nextStageId needs updating to 'NO_STAGE', previousStageId needs updating to our stageId
     */

    transactParams.TransactItems.push({
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldPreviousStageId}`,
          SK: Entities.STAGE,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
        UpdateExpression: 'SET nextStageId = :nextStageId, previousStageId = :previousStageId',
        ExpressionAttributeValues: {
          ':nextStageId': oldNextStageId,
          ':previousStageId': stageId,
        },
      },
    });
  } else if (oldNextStageId === updatedValues.previousStageId) {
    /**
     *   Old         New
     *
     * Stage 1  --- Stage 2 <-- previousStageId needs updating to 'NO_STAGE', nextStageId needs updating to our stageId
     * Stage 2 --- Stage 1 <-- Moved
     */

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
  } else {
    // Anything here assumes more than 1 stage difference moves

    /**
     *  Old         New
     *
     * Stage 1  --- Stage 3 <--- Moved
     * Stage 2 --- Stage 1  <-- previousStageId needs updating
     * Stage 3 --- Stage 2 <-- nextStageId needs updating
     */
    if (thereIsANewNextStage) {
      // Update that next stage's previousStageId to our stage
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
    if (thereIsANewPreviousStage) {
      // Update that previous stage's nextStageId to our stage
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
  }

  console.log(
    `FINAL TRANSACT PARAMS`,
    transactParams.TransactItems.map((item) => console.log(item)),
  );
  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
