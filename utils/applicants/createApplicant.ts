import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import Time from "../time";
import { nanoid } from "nanoid";
import { ENTITY_TYPES, ID_LENGTHS } from "../../defaults";
import { CreateApplicantInput, CreateApplicantOutput } from "../../types/main";
import { DynamoNewApplicant } from "../../types/dynamo";
const { DYNAMO_TABLE_NAME } = process.env;

/**
 * Creates an applicant in a given org
 * @param props {@link CreateApplicantInput}
 * @returns {@link CreateApplicantOutput}
 */
export async function createApplicant(
  props: CreateApplicantInput
): Promise<CreateApplicantOutput> {
  const { orgId, firstName, lastName, email, openingId, stageId } = props;

  const now = Time.currentISO();

  // Applicant ID has to be pretty high as the apply link will be their application link
  // https://zelark.github.io/nano-id-cc/
  const applicantId = nanoid(ID_LENGTHS.APPLICANT);

  const newApplicant: DynamoNewApplicant = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}#${applicantId}`,
    SK: ENTITY_TYPES.APPLICANT,
    firstName: firstName,
    lastName: lastName,
    fullName: `${firstName} ${lastName}`,
    email: email.toLowerCase().trim(),
    isemailVerified: false,
    orgId: orgId,
    applicantId: applicantId,
    entityType: ENTITY_TYPES.APPLICANT,
    createdAt: now,
    // TODO add phone number
    openingId: openingId,
    stageId: stageId,

    // The reason for the below is so we can get ALL applicants in an org, in an opening, or in a specific stage just by the ID of each.
    // Before we had `${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#{stageId}` for the SK which required the opening when getting applicants in specific stage
    // TODO recheck later if this is still good
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}S`,
    GSI1SK: `${ENTITY_TYPES.OPENING}#${openingId}#DATE_LANDED#${now}`,
    GSI2PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}S`,
    GSI2SK: `${ENTITY_TYPES.STAGE}#${stageId}#DATE_LANDED#${now}`,
  };

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Add an applicant item
          Put: {
            Item: newApplicant,
            TableName: DYNAMO_TABLE_NAME,
            ConditionExpression: "attribute_not_exists(PK)",
          },
        },

        {
          // Increment the opening's totalApplicants
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
              SK: `${ENTITY_TYPES.OPENING}`,
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
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}`,
              SK: `${ENTITY_TYPES.STAGE}`,
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
              PK: `${ENTITY_TYPES.ORG}#${orgId}`,
              SK: `${ENTITY_TYPES.ORG}`,
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
    return newApplicant;
  } catch (error) {
    // TODO error enum
    throw new Error(error);
  }
}
