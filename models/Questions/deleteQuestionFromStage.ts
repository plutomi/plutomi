import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { env } from '../../env';
import { DynamoStage } from '../../types/dynamo';
import * as Time from '../../utils/time';
interface DeleteQuestionFromStageInput
  extends Pick<DynamoStage, 'orgId' | 'openingId' | 'stageId'> {
  questionId: string;
  deleteIndex: number;
  /**
   * When removing a question from a stage, we want to decrement the stage count on the question.
   * This isn't needed if the question is deleted obviously, and is used in the deletion state machine.
   * which should only be deleting the adjacent item.
   * Set it to FALSE if the question has been deleted form the org.
   */
  decrementStageCount: boolean;
}

export const deleteQuestionFromStage = async (
  props: DeleteQuestionFromStageInput,
): Promise<[null, null] | [null, any]> => {
  const { orgId, openingId, stageId, questionId, deleteIndex, decrementStageCount } = props;

  const now = Time.currentISO();
  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Delete the adjacent item
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
        // Update the question order on the stage and decrement the total question count
        Update: {
          Key: {
            PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}`,
            SK: Entities.STAGE,
          },
          TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression: `REMOVE questionOrder[${deleteIndex}] SET totalQuestions = totalQuestions - :value, updatedAt = :updatedAt`,
          ExpressionAttributeValues: {
            ':value': 1,
            ':updatedAt': now,
          },
        },
      },
    ],
  };

  if (decrementStageCount) {
    transactParams.TransactItems.push({
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.QUESTION}#${questionId}`,
          SK: Entities.QUESTION,
        },
        TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
        UpdateExpression: 'SET totalStages = totalStages - :value, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':value': 1,
          ':updatedAt': now,
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
