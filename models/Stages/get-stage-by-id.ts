import { GetCommandInput, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from '../../Config';
import { GetStageByIdInput } from '../../types/main';
import { DynamoStage } from '../../types/dynamo';
/**
 * Returns a stage by its ID.
 * @param props {@link GetStageByIdInput}
 * @returns - {@link GetStageByIdOutput}
 */
export default async function GetStageById(
  props: GetStageByIdInput,
): Promise<[DynamoStage, null] | [null, SdkError]> {
  const { orgId, stageId, openingId } = props;
  const params: GetCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
      SK: ENTITY_TYPES.STAGE,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoStage, null];
  } catch (error) {
    return [null, error];
  }
}
