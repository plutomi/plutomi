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
  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
