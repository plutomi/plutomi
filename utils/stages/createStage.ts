import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param stage_name - Name of the stage (Questionnaire, Interviewing, Hired)
 * @param funnel_id - Where should this stage go
 * @param org_id - ID of org
 */
export async function CreateStage(
  org_id: string,
  stage_name: string,
  funnel_id: string
) {
  const now = GetCurrentTime("iso");
  const stage_id = nanoid(30);
  const new_stage = {
    PK: `ORG#${org_id}#STAGE#${stage_id}`,
    SK: `STAGE`,
    stage_name: stage_name,
    entity_type: "STAGE",
    created_at: now,
    stage_id: stage_id,
    funnel_id: funnel_id,
    GSI1PK: `ORG#${org_id}#STAGES`,
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
