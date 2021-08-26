import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param org_id - ID of org
 * @param stage_id - ID of stage where rule should be created
 * @param validation - What the rule is and what not
 */
export async function CreateStageRule(
  org_id: string,
  stage_id: string,
  validation: string
) {
  const now = dayjs().toISOString();
  const stage_rule_id = nanoid(30);
  const new_stage_rule = {
    PK: `ORG#${org_id}#STAGE#${stage_id}`,
    SK: `STAGE_RULE#${stage_rule_id}`,
    entity_type: "STAGE_RULE",
    created_at: now,
    validation: validation,
    GSI1PK: `ORG#${org_id}#RULES#STAGES`,
    GSI1SK: stage_id, // TODO filter by funnel by stage?
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_stage_rule,
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return new_stage_rule;
  } catch (error) {
    throw new Error(error);
  }
}
