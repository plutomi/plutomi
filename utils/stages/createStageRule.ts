import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../lib/awsClients/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateStageRule({
  org_id,
  openingId,
  stageId,
  validation,
}: CreateStageRuleInput) {
  const now = GetCurrentTime("iso") as string;
  const stage_rule_id = nanoid(16);
  const new_stage_rule = {
    PK: `ORG#${org_id}#OPENING#${openingId}#STAGE#${stageId}`,
    SK: `STAGE_RULE#${stage_rule_id}`,
    entity_type: "STAGE_RULE",
    created_at: now,
    validation: validation,
    GSI1PK: `ORG#${org_id}#RULES#STAGES`,
    GSI1SK: stageId, // TODO filter by opening by stage?
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
