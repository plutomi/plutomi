import { TransactWriteCommand, TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { Entities, DYNAMO_TABLE_NAME } from '../../Config';
import { DynamoQuestion } from '../../types/dynamo';
import { CreateQuestionInput } from '../../types/main';
import * as Time from '../../utils/time';

export default async function CreateQuestion(
  props: CreateQuestionInput,
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, GSI1SK, questionId, description } = props;
  const now = Time.currentISO();
  const newStageQuestion: DynamoQuestion = {
    PK: `${Entities.ORG}#${orgId}#${Entities.QUESTION}#${questionId}`,
    SK: Entities.QUESTION,
    orgId,
    description: description || '',
    questionId, // TODO add tag generator
    entityType: Entities.QUESTION,
    createdAt: now,
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
          Item: newStageQuestion,
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
          UpdateExpression: 'SET totalQuestions = if_not_exists(totalQuestions, :zero) + :value',
          ExpressionAttributeValues: {
            ':zero': 0,
            ':value': 1,
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
}
