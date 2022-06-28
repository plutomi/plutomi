import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoQuestion, DynamoStage } from '../../types/dynamo';

type GetQuestionsInStageInput = Pick<DynamoStage, 'orgId' | 'openingId' | 'stageId'>;

export const getQuestionsInStage = async (
  props: GetQuestionsInStageInput,
): Promise<[DynamoQuestion[], any]> => {
  const { orgId, openingId, stageId } = props;
  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :GSI1PK',
    ExpressionAttributeValues: {
      ':GSI1PK': `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}#${Entities.QUESTION}S`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items as DynamoQuestion[], null];
  } catch (error) {
    return [null, error];
  }
};
