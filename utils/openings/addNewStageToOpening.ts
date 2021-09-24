import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;

// TODO This needs to updated in the future to accomodate re-arranging stages
// but right now every new stage will get added to the end and thats fine
// TODO when creating a stage, use a transaction and call this
// TODO on stage deletion remove the stage id
export async function AddNewStageToOpening({
  org_id,
  opening_id,
  stage_id,
}: AddNewStageToOpeningInput) {
  const params: UpdateCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${org_id}#OPENING#${opening_id}`,
      SK: `OPENING`,
    },
    // Add the new stage to the end of the list
    // TODO to get a specific ID, we'd have to retrieve the funnel list and update it afterwrads
    UpdateExpression:
      "SET stage_order = list_append(stage_order, :new_stage_id)",
    ExpressionAttributeValues: {
      ":new_stage_id": [stage_id],
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const updated_opening = await Dynamo.send(new UpdateCommand(params));
    return updated_opening;
  } catch (error) {
    throw new Error(error);
  }
}
