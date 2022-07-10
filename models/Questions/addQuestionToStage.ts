import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoQuestionStageAdjacentItem, DynamoStage } from '../../types/dynamo';
import * as Time from '../../utils/time';

interface AddQuestionToStageInput
  extends Pick<DynamoStage, 'orgId' | 'openingId' | 'stageId' | 'questionOrder'> {
  questionId: string;
}

/**
 * Updates the questionOrder on the stage and creates another item
 * so that when the question is deleted, we can recursively
 * get all stages that had this question and update them as well
 */

export const addQuestionToStage = async (
  props: AddQuestionToStageInput,
): Promise<[null, null] | [null, any]> => {
  const { orgId, openingId, stageId, questionId, questionOrder } = props;
  const now = Time.currentISO();
  /**
   * This creates an adjacent item so that when a question is deleted,
   * we have a reference to all the stages that need to be updated asynchronously.
   *
   */
  const params: DynamoQuestionStageAdjacentItem = {
    PK: `${Entities.ORG}#${orgId}#${Entities.QUESTION}#${questionId}`,
    SK: `${Entities.QUESTION_ADJACENT_STAGE_ITEM}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}`,
    entityType: Entities.QUESTION_ADJACENT_STAGE_ITEM,
    createdAt: now,
    updatedAt: now,
    orgId,
    openingId,
    stageId,
    questionId,
  };

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Create the adjacent item
        Put: {
          Item: params,
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          // This should never conflict because we check
          // that a stage doesn't already have a question by this ID
          ConditionExpression: 'attribute_not_exists(PK)',
        },
      },
      {
        /**
         * If adding many questions to a stage,
         * there is a chance that the transaction will fail, make sure to wait in between each call
         * { Code: 'TransactionConflict',
         * Item: undefined,
         * Message: 'Transaction is ongoing for the item'}
         */
        Update: {
          Key: {
            PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}`,
            SK: Entities.STAGE,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression:
            'SET questionOrder = :questionOrder, totalQuestions = totalQuestions + :value, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':questionOrder': questionOrder,
            ':value': 1,
            ':updatedAt': now,
          },
        },
      },
      {
        // Update the totalStages count on the question
        Update: {
          Key: {
            PK: `${Entities.ORG}#${orgId}#${Entities.QUESTION}#${questionId}`,
            SK: Entities.QUESTION,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression:
            'SET totalStages = if_not_exists(totalStages, :zero) + :value, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':zero': 0,
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
    return [null, error];
  }
};
