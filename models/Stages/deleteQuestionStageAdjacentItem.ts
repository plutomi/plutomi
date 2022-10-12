import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { env } from '../../env';
import { DynamoQuestionStageAdjacentItem, DynamoStage } from '../../types/dynamo';
import * as Time from '../../utils/time';
interface DeleteQuestionStageAdjacentItemInput
  extends Pick<DynamoQuestionStageAdjacentItem, 'orgId' | 'stageId' | 'openingId' | 'questionId'> {}

export const deleteStageQuestionAdjacentItem = async (
  props: DeleteQuestionStageAdjacentItemInput,
): Promise<[null, null] | [null, any]> => {
  const { orgId, stageId, openingId, questionId } = props;
  const now = Time.currentISO();
  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Delete adjacent item
        Delete: {
          Key: {
            PK: `${Entities.ORG}#${orgId}#${Entities.QUESTION}#${questionId}`,
            SK: `${Entities.QUESTION_ADJACENT_STAGE_ITEM}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}`,
          },
          TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: 'attribute_exists(PK)',
        },
      },
      {
        // Update question's totalStages count, no conditional because it might have been deleted with the org
        Update: {
          Key: {
            PK: `${Entities.ORG}#${orgId}#${Entities.QUESTION}#${questionId}`,
            SK: Entities.QUESTION,
          },
          TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression: `SET totalStages = totalStages - :value, updatedAt = :updatedAt`,
          ExpressionAttributeValues: {
            ':value': 1,
            ':updatedAt': now,
          },
        },
      },
    ],
  };

  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    console.error('In dynamo call, error that occurred was', error);
    return [null, error];
  }
};
