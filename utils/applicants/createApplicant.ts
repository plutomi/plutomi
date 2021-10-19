import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";
import SendApplicantLink from "../email/sendApplicantLink";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateApplicant({
  org_id,
  email,
  first_name,
  last_name,
  opening_id,
  stage_id,
}: CreateApplicantInput) {
  const now = GetCurrentTime("iso");
  // Applicant ID has to be pretty high as the apply link will be the user ID
  // This is per org btw
  // https://zelark.github.io/nano-id-cc/
  const applicant_id = nanoid(50); // TODO - Also since applications are public, it should not be easily guessed - #165
  const new_applicant: DynamoApplicant = {
    PK: `ORG#${org_id}#APPLICANT#${applicant_id}`,
    SK: `APPLICANT`,
    first_name: first_name,
    last_name: last_name,
    full_name: `${first_name} ${last_name}`,
    email: email.toLowerCase(),
    email_verified: false,
    org_id: org_id,
    applicant_id: applicant_id,
    entity_type: "APPLICANT",
    created_at: now as string,
    // TODO add phone number
    // Is this needed? - Just makes it easier to grab than GSI1SK
    current_opening_id: opening_id,
    current_stage_id: stage_id,
    // Is this needed? - Just makes it easier to grab than GSI1SK

    GSI1PK: `ORG#${org_id}#APPLICANTS`,
    GSI1SK: `OPENING#${opening_id}#STAGE#${stage_id}`,

    // TODO ADD TIMESTAMP ABOVE ^
    // With just one index, i think we can get
    // 1. All applicants in an org
    // 2. All applicants in an opening
    // 3. All applicants in an opening in a specific stage

    // TODO Add another GSI2 with the timestamp they were created for easy filtering
    // of applicants who applied < x date
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_applicant,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await Dynamo.send(new PutCommand(params));

    return new_applicant;
  } catch (error) {
    throw new Error(error);
  }
}
