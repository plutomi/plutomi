import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetCurrentTime } from "../time";
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
  funnel_id: string,
  stage_id: string
) {
  const now = GetCurrentTime("iso");
  const applicant_id = nanoid(30);
  const new_applicant = {
    PK: `ORG#${org_id}#APPLICANT#${applicant_id}`,
    SK: `APPLICANT`,
    name: name,
    email: email,
    entity_type: "APPLICANT",
    created_at: now,
    applicant_id: applicant_id,
    GSI1PK: `ORG#${org_id}#APPLICANTS`,
    GSI1SK: `FUNNEL#${funnel_id}#STAGE#${stage_id}`, // Essetially their current stage AND funnel
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
