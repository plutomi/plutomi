import { DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;

// TODO check if stage is empt of appliants first
// TODO delete stage from the funnels sort order
export async function DeleteStage({
  org_id,
  opening_id,
  stage_id,
}: DeleteStageInput) {
  const params: DeleteCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${org_id}#OPENING#${opening_id}#STAGE#${stage_id}`,
      SK: `STAGE`,
    },
  };

  console.log("PK", params.Key.PK);
  try {
    await Dynamo.send(new DeleteCommand(params));
  } catch (error) {
    throw new Error(error);
  }
}
