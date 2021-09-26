import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;

// When dragging / dropping stages, this sets the new order for them
export default async function ReorderStages({
  org_id,
  opening_id,
  new_stage_order,
}: ReorderStagesInput) {
  const params: UpdateCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${org_id}#OPENING#${opening_id}`,
      SK: `OPENING`,
    },
    UpdateExpression: "SET stage_order =  :new_stage_order",
    ExpressionAttributeValues: {
      ":new_stage_order": new_stage_order,
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return;
  } catch (error) {
    throw new Error(error);
  }
}
