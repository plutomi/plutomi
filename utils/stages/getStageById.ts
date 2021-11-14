import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { GetStageByIdInput, GetStageByIdOutput } from "./types/Stages";

const { DYNAMO_TABLE_NAME } = process.env;

export async function getStageById(
  props: GetStageByIdInput
): Promise<GetStageByIdOutput> {
  const { orgId, stageId } = props;
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${orgId}#STAGE#${stageId}`,
      SK: `STAGE`,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return response.Item as GetStageByIdOutput;
  } catch (error) {
    throw new Error(error);
  }
}
