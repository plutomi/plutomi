import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param stage_name
 * @param funnel_id
 * @param org_url_name
 */
export async function CreateStage({
  org_url_name,
  stage_name,
  funnel_id,
}: CreateStageInput) {
  // TODO **MAJOR** Do not allow creation of stages with the same name

  const now = GetCurrentTime("iso");
  const stage_id = nanoid(10);
  const new_stage = {
    PK: `ORG#${org_url_name}#FUNNEL#${funnel_id}#STAGE${stage_id}`,
    SK: `STAGE`,
    stage_name: stage_name,
    entity_type: "STAGE",
    created_at: now,
    stage_id: stage_id,
    funnel_id: funnel_id,
    GSI1PK: `ORG#${org_url_name}#STAGES`,
    GSI1SK: stage_name,
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_stage,
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return new_stage;
  } catch (error) {
    throw new Error(error);
  }
}
