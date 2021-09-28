import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateStageQuestion({
  org_id,
  opening_id,
  stage_id,
  question_title,
  question_description,
}: CreateStageQuestionInput) {
  const now = GetCurrentTime("iso");
  const stage_question_id = nanoid(10);
  const new_stage_question = {
    PK: `ORG#${org_id}#OPENING#${opening_id}#STAGE#${stage_id}`,
    SK: `STAGE_QUESTION#${stage_question_id}`,
    question_description: question_description,
    question_id: stage_question_id,
    entity_type: "STAGE_QUESTION",
    created_at: now,
    GSI1PK: `ORG#${org_id}#QUESTIONS`,
    GSI1SK: question_title, // TODO filter by opening by stage?
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_stage_question,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return new_stage_question;
  } catch (error) {
    throw new Error(error);
  }
}
