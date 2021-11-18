import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../defaults";
import { GetStageByIdInput, GetStageByIdOutput } from "../../types/main";

const { DYNAMO_TABLE_NAME } = process.env;

/**
 * Returns a stage by its ID.
 * @param props {@link GetStageByIdInput}
 * @returns - {@link GetStageByIdOutput}
 */
export async function getStageById(
  props: GetStageByIdInput
): Promise<GetStageByIdOutput> {
  const { orgId, stageId } = props;
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}`,
      SK: `${ENTITY_TYPES.STAGE}`,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return response.Item as GetStageByIdOutput;
  } catch (error) {
    throw new Error(error);
  }
}
