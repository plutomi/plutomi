import { GetCommandInput, GetCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoStage } from '../../types/dynamo';

type GetStageByIdInput = Pick<DynamoStage, 'orgId' | 'stageId' | 'openingId'>;

export const getStage = async (
  props: GetStageByIdInput,
): Promise<[DynamoStage, null] | [null, any]> => {
  const { orgId, stageId, openingId } = props;
  const params: GetCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    Key: {
      PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}`,
      SK: Entities.STAGE,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoStage, null];
  } catch (error) {
    return [null, error];
  }
};
