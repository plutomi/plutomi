import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param name - Name of the stage (Questionnaire, Interviewing, Hired)
 * @param org_id - ID of org
 */
export async function CreateStage(org_id: string, name: string) {
  const now = dayjs().toISOString();
  const stage_id = nanoid(30);
  const new_stage = {
    PK: `ORG#${org_id}#STAGE#${stage_id}`,
    SK: `STAGE`,
    name: name,
    entity_type: "STAGE",
    created_at: now,
    stage_id: stage_id,
    GSI1PK: `ORG#${org_id}#STAGES`,
    GSI1SK: name,
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
