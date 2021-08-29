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
export async function CreateStageQuestion(
  org_url_name: string,
  stage_id: string,
  question_title: string
) {
  const now = GetCurrentTime("iso");
  const stage_question_id = nanoid(30);
  const new_stage_question = {
    PK: `ORG#${org_url_name}#STAGE#${stage_id}`,
    SK: `STAGE_QUESTION#${stage_question_id}`,
    question_title: question_title,
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
