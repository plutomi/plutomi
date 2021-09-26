import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;
import { GetOpening } from "./getOpeningById";

// TODO on stage deletion remove the stage id
// hmm... there is a trick to this to update all variables at once...
// I have it saved in the other repo

// For now, we have to get the opening, get the stage_order in the opening
// Adde the delete stage at the id provided, and update the opening
export async function RemoveStageFromStageOrder({
  org_id,
  opening_id,
  stage_id,
}) {
  const opening = await GetOpening({ org_id, opening_id });

  if (!opening) {
    throw new Error("Opening not found"); // Not sure how this would get triggerred.. anywya
  }
  let new_stage_order = opening.stage_order;

  const index_to_remove = new_stage_order.indexOf(stage_id);

  if (index_to_remove < 0) {
    throw new Error("Stage not found in stage order for the funnel");
  }
  // Remove from array
  new_stage_order.splice(index_to_remove, 1);

  const params: UpdateCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${org_id}#OPENING#${opening_id}`,
      SK: `OPENING`,
    },
    // Add the new stage to the end of the list
    // TODO to get a specific ID, we'd have to retrieve the opening list and update it afterwrads
    UpdateExpression: "SET stage_order =  :new_stage_order",
    ExpressionAttributeValues: {
      ":new_stage_order": new_stage_order,
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const updated_opening = await Dynamo.send(new UpdateCommand(params));
    console.log("Updated opening with deleted stage order", updated_opening);
    return updated_opening;
  } catch (error) {
    throw new Error(error);
  }
}
