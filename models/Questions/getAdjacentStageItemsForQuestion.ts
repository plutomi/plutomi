import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoQuestion, DynamoQuestionStageAdjacentItem, DynamoStage } from '../../types/dynamo';

interface GetAdjacentStageItemsForQuestionProps
  extends Pick<DynamoQuestion, 'orgId' | 'questionId'> {
  questionId: string;
}

export const getAdjacentStageItemsForQuestion = async (
  props: GetAdjacentStageItemsForQuestionProps,
): Promise<[DynamoQuestionStageAdjacentItem[], any]> => {
  const { orgId, questionId } = props;
  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    KeyConditionExpression: 'PK = :PK AND begins_with(SK, :SK)',
    ExpressionAttributeValues: {
      ':PK': `${Entities.ORG}#${orgId}#${Entities.QUESTION}#${questionId}`,
      ':SK': Entities.QUESTION_ADJACENT_STAGE_ITEM,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items as DynamoQuestionStageAdjacentItem[], null];
  } catch (error) {
    return [null, error];
  }
};
