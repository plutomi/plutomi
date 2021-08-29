import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { GetCurrentTime } from "../time";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param question_title
 * @param org_url_name
 * @param stage_id
 */
export async function CreateStageQuestion({
  org_url_name,
  funnel_id,
  stage_id,
  question_title,
  question_description,
}: CreateStageQuestionInput) {
  const now = GetCurrentTime("iso");
  const stage_question_id = nanoid(10);
  const new_stage_question = {
    PK: `ORG#${org_url_name}#FUNNEL#${funnel_id}#STAGE${stage_id}`,
    SK: `STAGE_QUESTION#${stage_question_id}`,
    question_title: question_title,
    question_description: question_description,
    entity_type: "STAGE_QUESTION",
    created_at: now,
    GSI1PK: `ORG#${org_url_name}#QUESTIONS`,
    GSI1SK: question_title, // TODO filter by funnel by stage?
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_stage_question,
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return new_stage_question;
  } catch (error) {
    throw new Error(error);
  }
}
