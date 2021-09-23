import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateApplicant({
  org_id,
  applicant_email,
  applicant_first_name,
  applicant_last_name,
  opening_id,
  stage_id,
}: CreateApplicantInput) {
  const now = GetCurrentTime("iso");
  const applicant_id = nanoid(70);
  const new_applicant = {
    PK: `ORG#${org_id}#APPLICANT#${applicant_id}`,
    SK: `APPLICANT`,
    applicant_first_name: applicant_first_name,
    applicant_last_name: applicant_last_name,
    applicant_full_name: `${applicant_first_name} ${applicant_last_name}`,
    applicant_email: applicant_email,
    applicant_id: applicant_id,
    entity_type: "APPLICANT",
    created_at: now,
    GSI1PK: `ORG#${org_id}#APPLICANTS`,
    GSI1SK: `OPENING#${opening_id}#STAGE#${stage_id}`, // Essetially their current stage AND opening
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
