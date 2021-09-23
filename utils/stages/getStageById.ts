import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;

export async function GetStageById({
  org_id,
  funnel_id,
  stage_id,
}: GetStageByIdInput) {
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${org_id}#FUNNEL#${funnel_id}#STAGE#${stage_id}`,
      SK: `STAGE`,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    console.log("called dynamo", response);
    return response.Item;
  } catch (error) {
    throw new Error(error);
  }
}
