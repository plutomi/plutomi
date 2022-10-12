import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { env } from '../../env';
import { DynamoOpening, DynamoStage } from '../../types/dynamo';

type GetStagesInOpeningInput = Pick<DynamoOpening, 'orgId' | 'openingId' | 'stageOrder'>;

export const getStagesInOpening = async (
  props: GetStagesInOpeningInput,
  // TODO replace any with actual dynamo error type,
): Promise<[DynamoStage[], null] | [null, any]> => {
  const { orgId, openingId, stageOrder } = props;
  const params: QueryCommandInput = {
    TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :GSI1PK',
    ExpressionAttributeValues: {
      ':GSI1PK': `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}S`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    const allStages = response.Items as DynamoStage[];

    // Orders results in the way the stageOrder is
    const result = stageOrder.map((i: string) => allStages.find((j) => j.stageId === i));
    return [result as DynamoStage[], null];
  } catch (error) {
    return [null, error];
  }
};
