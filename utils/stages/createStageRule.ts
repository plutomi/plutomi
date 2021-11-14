import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import Time from "../time";
import { nanoid } from "nanoid";
import {
  CreateStageRuleInput,
  CreateStageRuleOutput,
  StageRuleDynamoEntry,
} from "./types/StageRules";
import { EntityTypes } from "../../types/additional";

const { DYNAMO_TABLE_NAME } = process.env;

export async function createStageRule(
  props: CreateStageRuleInput
): Promise<CreateStageRuleOutput> {
  const { orgId, openingId, stageId, validation } = props;
  const now = Time.currentISO();
  const stageRuleId = nanoid(16);
  const newStageRule: StageRuleDynamoEntry = {
    PK: `ORG#${orgId}#OPENING#${openingId}#STAGE#${stageId}`,
    SK: `STAGE_RULE#${stageRuleId}`,
    entityType: EntityTypes.STAGE_RULE,
    createdAt: now,
    validation: validation, // TODO add validation
    GSI1PK: `ORG#${orgId}#RULES#STAGES`,
    GSI1SK: stageId, // TODO filter by opening by stage?
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: newStageRule,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return newStageRule;
  } catch (error) {
    throw new Error(error);
  }
}
