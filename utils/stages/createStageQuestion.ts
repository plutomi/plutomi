import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param title - title of the question (How are you?, How old are you?)
 * @param org_id - ID of org
 * @param stage_id - ID of stage where question should be created
 */
export async function CreateStageQuestion(
  org_id: string,
  stage_id: string,
  title: string
) {
  const now = dayjs().toISOString();
  const stage_question_id = nanoid(30);
  const new_stage_question = {
    PK: `ORG#${org_id}#STAGE#${stage_id}`,
    SK: `STAGE_QUESTION#${stage_question_id}`,
    title: title,
    entity_type: "STAGE_QUESTION",
    created_at: now,
    GSI1PK: `ORG#${org_id}#QUESTIONS`,
    GSI1SK: title, // TODO filter by funnel by stage?
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
