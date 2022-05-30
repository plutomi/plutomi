import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../../Config';
import { DynamoQuestion } from '../../../types/dynamo';

export interface UpdateQuestionInput extends Pick<DynamoQuestion, 'orgId' | 'questionId'> {
  newValues: { [key: string]: any };
}

// TODO new udpate method https://github.com/plutomi/plutomi/issues/594
export const updateQuestion = async (
  props: UpdateQuestionInput,
): Promise<[null, null] | [null, SdkError]> => {
  const { orgId, questionId, newValues } = props;
  // Build update expression
  const allUpdateExpressions: string[] = [];
  const allAttributeValues: { [key: string]: string } = {};

  // https://github.com/plutomi/plutomi/issues/594
  // eslint-disable-next-line no-restricted-syntax
  for (const property of Object.keys(newValues)) {
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = newValues[property];
  }

  const params = {
    Key: {
      PK: `${Entities.ORG}#${orgId}#${Entities.QUESTION}#${questionId}`,
      SK: Entities.QUESTION,
    },
    UpdateExpression: `SET ${allUpdateExpressions.join(', ')}`,
    ExpressionAttributeValues: allAttributeValues,
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    ConditionExpression: 'attribute_exists(PK)',
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
