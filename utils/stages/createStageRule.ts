import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { getCurrentTime } from "../time";
import { nanoid } from "nanoid";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateStageRule({
  orgId,
  opening_id,
  stage_id,
  validation,
}: CreateStageRuleInput) {
  const now = getCurrentTime("iso") as string;
  const stage_rule_id = nanoid(16);
  const new_stage_rule = {
    PK: `ORG#${orgId}#OPENING#${opening_id}#STAGE#${stage_id}`,
    SK: `STAGE_RULE#${stage_rule_id}`,
    entityType: "STAGE_RULE",
    created_at: now,
    validation: validation,
    GSI1PK: `ORG#${orgId}#RULES#STAGES`,
    GSI1SK: stage_id, // TODO filter by opening by stage?
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
