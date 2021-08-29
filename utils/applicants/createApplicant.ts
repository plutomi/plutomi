import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param applicant_name
 * @param org_url_name
 * @param applicant_email
 * @param funnel_id - Current funnel of the applicant
 * @param stage_id - Current stage of the applicant
 */
export async function CreateApplicant(
  org_url_name: string,
  applicant_name: string,
  applicant_email: string,
  funnel_id: string,
  stage_id: string
) {
  const now = GetCurrentTime("iso");
  const applicant_id = nanoid(30);
  const new_applicant = {
    PK: `ORG#${org_url_name}#APPLICANT#${applicant_id}`,
    SK: `APPLICANT`,
    applicant_name: applicant_name,
    applicant_email: applicant_email,
    applicant_id: applicant_id,
    entity_type: "APPLICANT",
    created_at: now,
    GSI1PK: `ORG#${org_url_name}#APPLICANTS`,
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
