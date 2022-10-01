import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoOpening, DynamoStage } from '../../types/dynamo';
import { sortStages } from './utils';

type GetStagesInOpeningInput = Pick<DynamoOpening, 'orgId' | 'openingId'>;

export const getStagesInOpening = async (
  props: GetStagesInOpeningInput,
  // TODO replace any with actual dynamo error type,
): Promise<[DynamoStage[], null] | [null, any]> => {
  const { orgId, openingId } = props;
  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :GSI1PK',
    ExpressionAttributeValues: {
      ':GSI1PK': `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}S`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    const allStages = response.Items as DynamoStage[];

    const result = sortStages(allStages);
    return [result as DynamoStage[], null];
  } catch (error) {
    return [null, error];
  }
};
