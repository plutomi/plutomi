import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateApplicant({
  orgId,
  email,
  firstName,
  lastName,
  openingId,
  stageId,
}: CreateApplicantInput) {
  const now = GetCurrentTime("iso") as string;
  // Applicant ID has to be pretty high as the apply link will be the user ID
  // This is per org btw
  // https://zelark.github.io/nano-id-cc/
  const applicantId = nanoid(50); // TODO - Also since applications are public, it should not be easily guessed - #165
  const new_applicant: DynamoApplicant = {
    PK: `ORG#${orgId}#APPLICANT#${applicantId}`,
    SK: `APPLICANT`,
    firstName: firstName,
    lastName: lastName,
    fullName: `${firstName} ${lastName}`,
    email: email.toLowerCase().trim(),
    email_verified: false,
    orgId: orgId,
    applicantId: applicantId,
    entityType: "APPLICANT",
    createdAt: now,
    // TODO add phone number
    currentOpeningId: openingId,
    currentStageId: stageId,

    // The reason for the below is so we can get applicants in an org, in an opening, or in a specific stagejust by the ID of each.
    // Before we had `OPENING#${openingId}#STAGE#{stageId}` for the SK which required the opening when getting applicants in specific stage
    GSI1PK: `ORG#${orgId}#APPLICANTS`,
    GSI1SK: `OPENING#${openingId}#DATE_LANDED#${now}`,
    GSI2PK: `ORG#${orgId}#APPLICANTS`,
    GSI2SK: `STAGE#${stageId}#DATE_LANDED#${now}`,
  };

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Add an applicant item
          Put: {
            Item: new_applicant,
            TableName: DYNAMO_TABLE_NAME,
            ConditionExpression: "attribute_not_exists(PK)",
          },
        },

        {
          // Increment the opening's totalApplicants
          Update: {
            Key: {
              PK: `ORG#${orgId}#OPENING#${openingId}`,
              SK: `OPENING`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET totalApplicants = if_not_exists(totalApplicants, :zero) + :value",
            ExpressionAttributeValues: {
              ":zero": 0,
              ":value": 1,
            },
          },
        },
        {
          // Increment the stage's total applicants
          Update: {
            Key: {
              PK: `ORG#${orgId}#STAGE#${stageId}`,
              SK: `STAGE`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET totalApplicants = if_not_exists(totalApplicants, :zero) + :value",
            ExpressionAttributeValues: {
              ":zero": 0,
              ":value": 1,
            },
          },
        },
        {
          // Increment the org's total applicants
          Update: {
            Key: {
              PK: `ORG#${orgId}`,
              SK: `ORG`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET totalApplicants = if_not_exists(totalApplicants, :zero) + :value",
            ExpressionAttributeValues: {
              ":zero": 0,
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
