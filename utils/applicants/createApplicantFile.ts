import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { GetCurrentTime } from "../time";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param applicant_name
 * @param applicant_email
 * @param org_id
 */
export async function CreateApplicantFile(
  org_id: string,
  applicant_name: string,
  applicant_email: string,
  applicant_id: string
) {
  const file_id = nanoid(30);
  const new_applicant = {
    PK: `ORG#${org_id}#APPLICANT#${applicant_id}`,
    SK: `APPLICANT_FILE#${applicant_id}`,
    entity_type: "FILE",
    applicant_name: applicant_name,
    email: applicant_email,
    created_at: GetCurrentTime("iso"),
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
