import { TransactWriteCommand, TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { env } from '../../env';
import { DynamoQuestion } from '../../types/dynamo';
import * as Time from '../../utils/time';
interface DeleteQuestionFromOrgInput extends Pick<DynamoQuestion, 'orgId' | 'questionId'> {
  /**
   * Whether to decrement the org's total question count
   */
  updateOrg: boolean;
}

export const deleteQuestionFromOrg = async (
  props: DeleteQuestionFromOrgInput,
): Promise<[null, null] | [null, any]> => {
  const { orgId, questionId, updateOrg } = props;
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
          TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: 'attribute_exists(PK)',
        },
      },
    ],
  };

  if (updateOrg) {
    transactParams.TransactItems.push({
      // Decrement the org's totalQuestions
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}`,
          SK: Entities.ORG,
        },
        TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
        UpdateExpression: 'SET totalQuestions = totalQuestions - :value, updatedAt = :updatedAt',
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
