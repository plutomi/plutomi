import {
  PutCommand,
  PutCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
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
  const now = GetCurrentTime("iso") as string;
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
    created_at: now,
    // TODO add phone number
    current_opening_id: opening_id,
    current_stage_id: stage_id,
    GSI1PK: `ORG#${org_id}#APPLICANTS`,
    GSI1SK: `OPENING#${opening_id}#STAGE#${stage_id}`,
  };

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Add a stage item
          Put: {
            Item: new_applicant,
            TableName: DYNAMO_TABLE_NAME,
            ConditionExpression: "attribute_not_exists(PK)",
          },
        },

        {
          // Add applicant to opening's total_applicants
          Update: {
            Key: {
              PK: `ORG#${org_id}#OPENING#${opening_id}`,
              SK: `OPENING`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET total_applicants = total_applicants + :value",
            ExpressionAttributeValues: {
              ":value": 1,
            },
          },
        },
        {
          // Add applicant to the stage total_applicants
          Update: {
            Key: {
              PK: `ORG#${org_id}#STAGE#${stage_id}`,
              SK: `STAGE`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET total_applicants = total_applicants + :value",
            ExpressionAttributeValues: {
              ":value": 1,
            },
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));
    return new_applicant;
  } catch (error) {
    throw new Error(error);
  }
}
