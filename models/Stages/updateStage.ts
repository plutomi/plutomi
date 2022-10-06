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
  const thereWasAnOldNextStage = oldNextStageId !== NO_STAGE;
  const thereWasAnOldPreviousStage = oldPreviousStageId !== NO_STAGE;

  // If there is a new next stage, update that stage's previous stage ID to be of our stage
  // AND update the OLD next stage's previous stage to the OLD previous stage ID

  if (thereIsANewNextStage) {
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

    if (thereWasAnOldNextStage && oldNextStageId !== updatedValues.nextStageId) {
      // Dynamo preventing double updates, and if its already being update theres no need
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
  }

  // If there is a new previous stage, update that stage's next stage ID to be of our stage
  // AND update the OLD previous stage's next stage to the OLD next stage ID
  if (thereIsANewPreviousStage) {
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

    if (thereWasAnOldPreviousStage && oldPreviousStageId !== updatedValues.nextStageId) {
      // Dynamo preventing double updates, and if its already being update theres no need

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
    }
  }

  // // If our stage (before the update) had a previous stage ID, we need to set that stages' next stage id to our stage
  // if (
  //   oldPreviousStageId &&
  //   oldPreviousStageId !== NO_STAGE &&
  //   // We need this stupid check here because dynamo will error out if we are updating those stages above due to multiple operations on one item
  //   oldPreviousStageId !== updatedValues.nextStageId
  // ) {
  //   transactParams.TransactItems.push({
  //     Update: {
  //       Key: {
  //         PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldPreviousStageId}`,
  //         SK: Entities.STAGE,
  //       },
  //       TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
  //       UpdateExpression: 'SET nextStageId = :nextStageId',
  //       ExpressionAttributeValues: {
  //         ':nextStageId': stageId,
  //       },
  //     },
  //   });
  // }

  // // If our stage (before the update) had a next stage ID, we need to set that stages' previous stage id to our stage
  // if (
  //   oldNextStageId &&
  //   oldNextStageId !== NO_STAGE &&
  //   // We need this stupid check here because dynamo will error out if we are updating those stages above due to multiple operations on one item
  //   oldNextStageId !== updatedValues.previousStageId
  // ) {
  //   transactParams.TransactItems.push({
  //     Update: {
  //       Key: {
  //         PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${oldNextStageId}`,
  //         SK: Entities.STAGE,
  //       },
  //       TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
  //       UpdateExpression: 'SET previousStageId = :previousStageId',
  //       ExpressionAttributeValues: {
  //         ':previousStageId': stageId,
  //       },
  //     },
  //   });
  // }

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
