import { GetCommandInput, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { GetStageByIdInput, GetStageByIdOutput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
/**
 * Returns a stage by its ID.
 * @param props {@link GetStageByIdInput}
 * @returns - {@link GetStageByIdOutput}
 */
export default async function Get(
  props: GetStageByIdInput
): Promise<[GetStageByIdOutput, null] | [null, SdkError]> {
  const { orgId, stageId } = props;
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}`,
      SK: ENTITY_TYPES.STAGE,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as GetStageByIdOutput, null];
  } catch (error) {
    return [null, error];
  }
}
