import { TransactWriteCommand, TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { Entities, DYNAMO_TABLE_NAME } from '../../Config';
import { DynamoQuestion } from '../../types/dynamo';
import * as Time from '../../utils/time';

type CreateQuestionInput = Pick<DynamoQuestion, 'orgId' | 'GSI1SK' | 'description' | 'questionId'>;

export const createQuestion = async (
  props: CreateQuestionInput,
): Promise<[DynamoQuestion, null] | [null, any]> => {
  const { orgId, GSI1SK, questionId, description } = props;
  const now = Time.currentISO();
  const newQuestion: DynamoQuestion = {
    PK: `${Entities.ORG}#${orgId}#${Entities.QUESTION}#${questionId}`,
    SK: Entities.QUESTION,
    orgId,
    description: description || '',
    questionId,
    entityType: Entities.QUESTION,
    createdAt: now,
    updatedAt: now,
    totalStages: 0,
    // All questions in org
    GSI1PK: `${Entities.ORG}#${orgId}#${Entities.QUESTION}S`,
    GSI1SK,
  };

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Create the Question
        Put: {
          Item: newQuestion,
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: 'attribute_not_exists(PK)',
        },
      },
      {
        // Increment the org's totalQuestions
        Update: {
          Key: {
            PK: `${Entities.ORG}#${orgId}`,
            SK: Entities.ORG,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression:
            'SET totalQuestions = if_not_exists(totalQuestions, :zero) + :value, updatedAt = :updatedAt',
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
    return [newQuestion, null];
  } catch (error) {
    return [null, error];
  }
};
