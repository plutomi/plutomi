import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param name - Name of the stage (Questionnaire, Interviewing, Hired)
 * @param org_id - ID of org
 * @param funnel_id - Current funnel of the applicant
 * @param stage_id - Current stage of the applicant
 */
export async function CreateStage(
  org_id: string,
  name: string,
  email: string,
  applicant_id: string
) {
  const now = dayjs().toISOString();
  const file_id = nanoid(30);
  const new_applicant = {
    PK: `ORG#${org_id}#APPLICANT#${applicant_id}`,
    SK: `APPLICANT_FILE#${applicant_id}`,
    entity_type: "FILE",
    name: name,
    email: email,
    created_at: now,
    file_id: file_id,
    GSI1PK: `ORG#${org_id}#FILES`,
    GSI1SK: `TODO some timestamp ${nanoid(10)}`,
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_applicant,
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return new_applicant;
  } catch (error) {
    throw new Error(error);
  }
}
