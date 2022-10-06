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

  // If our newly updated stage has a nextStageId, we need to set previousStageId on that nextStage to be our newly updated stageId
  if (updatedValues.nextStageId && updatedValues.nextStageId !== NO_STAGE) {
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
  // If our newly updated stage has a previousStageId, we need to set nextStageId on that previousStage to be our newly updated stageId
  if (updatedValues.previousStageId && updatedValues.previousStageId !== NO_STAGE) {
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

  // If our stage (before the update) had a previous stage ID, we need to set that stages' next stage id to our stage
  if (
    oldPreviousStageId &&
    oldPreviousStageId !== NO_STAGE &&
    // We need this stupid check here because dynamo will error out if we are updating those stages above due to multiple operations on one item
    oldPreviousStageId !== updatedValues.nextStageId
  ) {
    transactParams.TransactItems.push({
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldPreviousStageId}`,
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

  // If our stage (before the update) had a next stage ID, we need to set that stages' previous stage id to our stage
  if (
    oldNextStageId &&
    oldNextStageId !== NO_STAGE &&
    // We need this stupid check here because dynamo will error out if we are updating those stages above due to multiple operations on one item
    oldNextStageId !== updatedValues.previousStageId
  ) {
    transactParams.TransactItems.push({
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldNextStageId}`,
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
