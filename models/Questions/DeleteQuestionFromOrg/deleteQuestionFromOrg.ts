import { TransactWriteCommand, TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../../Config';
import { DynamoQuestion } from '../../../types/dynamo';

type DeleteQuestionFromOrgInput = Pick<DynamoQuestion, 'orgId' | 'questionId'>;

export const deleteQuestionFromOrg = async (
  props: DeleteQuestionFromOrgInput,
): Promise<[undefined, undefined] | [undefined, SdkError]> => {
  const { orgId, questionId } = props;

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
          UpdateExpression: 'SET totalQuestions = totalQuestions - :value',
          ExpressionAttributeValues: {
            ':value': 1,
          },
        },
      },
    ],
  };
  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [undefined, undefined];
  } catch (error) {
    return [undefined, error];
  }
};
