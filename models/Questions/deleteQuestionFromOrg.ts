import { TransactWriteCommand, TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoQuestion } from '../../types/dynamo';
import * as Time from '../../utils/time';
type DeleteQuestionFromOrgInput = Pick<DynamoQuestion, 'orgId' | 'questionId'>;

export const deleteQuestionFromOrg = async (
  props: DeleteQuestionFromOrgInput,
): Promise<[null, null] | [null, any]> => {
  const { orgId, questionId } = props;
  const now = Time.currentISO();

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Delete question from org
        Delete: {
          Key: {
            PK: `${Entities.ORG}#${orgId}#${Entities.QUESTION}#${questionId}`,
            SK: Entities.QUESTION,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: 'attribute_exists(PK)',
        },
      },
      {
        // Decrement the org's totalQuestions
        Update: {
          Key: {
            PK: `${Entities.ORG}#${orgId}`,
            SK: Entities.ORG,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression: 'SET totalQuestions = totalQuestions - :value, updatedAt = :updatedAt',
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
    return [null, error];
  }
};
