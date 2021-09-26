import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";
import UpdateOpening from "../openings/updateOpening";
import { GetOpening } from "../openings/getOpeningById";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateStage({
  org_id,
  stage_name,
  opening_id,
}: CreateStageInput) {
  const now = GetCurrentTime("iso");
  const stage_id = nanoid(10);
  const new_stage = {
    PK: `ORG#${org_id}#OPENING#${opening_id}#STAGE#${stage_id}`,
    SK: `STAGE`,
    stage_name: stage_name,
    entity_type: "STAGE",
    created_at: now,
    stage_id: stage_id,
    opening_id: opening_id,
    GSI1PK: `ORG#${org_id}#OPENING#${opening_id}#STAGES`, // Get all stages in an opening
    GSI1SK: stage_name,
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_stage,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    console.log("Creating new stage");
    // TODO make this a transact
    await Dynamo.send(new PutCommand(params));

    let opening = await GetOpening({ org_id, opening_id });
    opening.stage_order.push(stage_id);
    const update_opening_input = {
      org_id: org_id,
      opening_id: opening_id,
      updated_opening: opening,
    };

    await UpdateOpening(update_opening_input);

    return;
  } catch (error) {
    throw new Error(error);
  }
}
