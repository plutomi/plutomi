import { GetCommandInput, GetCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { env } from '../../env';
import { DynamoQuestion } from '../../types/dynamo';

type GetQuestionInput = Pick<DynamoQuestion, 'orgId' | 'questionId'>;

export const getQuestion = async (
  props: GetQuestionInput,
): Promise<[DynamoQuestion, null] | [null, any]> => {
  const { orgId, questionId } = props;
  const params: GetCommandInput = {
    TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
    Key: {
      PK: `${Entities.ORG}#${orgId}#${Entities.QUESTION}#${questionId}`,
      SK: Entities.QUESTION,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoQuestion, null];
  } catch (error) {
    return [null, error];
  }
};
