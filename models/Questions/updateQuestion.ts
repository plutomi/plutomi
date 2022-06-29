import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { APIUpdateQuestionOptions } from '../../Controllers/Questions/updateQuestion';
import { DynamoQuestion } from '../../types/dynamo';
import { createDynamoUpdateExpression } from '../../utils/createDynamoUpdateExpression';

export interface UpdateQuestionInput extends Pick<DynamoQuestion, 'orgId' | 'questionId'> {
  updatedValues: APIUpdateQuestionOptions;
}

export const updateQuestion = async (
  props: UpdateQuestionInput,
): Promise<[null, null] | [null, any]> => {
  const { orgId, questionId, updatedValues } = props;

  const { allUpdateExpressions, allAttributeValues } = createDynamoUpdateExpression({
    updatedValues,
  });

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
