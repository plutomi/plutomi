import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { GetCurrentTime } from "../time";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param org_id
 * @param stage_id - Which stage should the rule be created in
 * @param validation - What the rule is and what not // TODO
 */
export async function CreateStageRule({
  org_id,
  funnel_id,
  stage_id,
  validation,
}: CreateStageRuleInput) {
  const now = GetCurrentTime("iso");
  const stage_rule_id = nanoid(30);
  const new_stage_rule = {
    PK: `ORG#${org_id}#STAGE${stage_id}`,
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
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return new_stage_rule;
  } catch (error) {
    throw new Error(error);
  }
}
