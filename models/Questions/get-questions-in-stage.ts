import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from '../../Config';
import { DynamoQuestion } from '../../types/dynamo';
import { GetQuestionsInStageInput } from '../../types/main';

export default async function GetQuestionsInStage(
  props: GetQuestionsInStageInput,
): Promise<[DynamoQuestion[], SdkError]> {
  const { orgId, openingId, stageId } = props;

  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :GSI1PK',
    ExpressionAttributeValues: {
      ':GSI1PK': `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}#${ENTITY_TYPES.QUESTION}S`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items as DynamoQuestion[], null];
  } catch (error) {
    return [null, error];
  }
}
