import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ID_LENGTHS, ENTITY_TYPES } from "../../Config";
import { DynamoNewApplicant } from "../../types/dynamo";
import { CreateApplicantInput, CreateApplicantOutput } from "../../types/main";
import * as Time from "../../utils/time";
import { SdkError } from "@aws-sdk/types";
import { sealData } from "iron-session";
const { DYNAMO_TABLE_NAME } = process.env;

export default async function Create(
  props: CreateApplicantInput
): Promise<[CreateApplicantOutput, null] | [null, SdkError]> {
  const { orgId, firstName, lastName, email, openingId, stageId } = props;

  const now = Time.currentISO();
  const applicantId = nanoid(ID_LENGTHS.APPLICANT);

  const newApplicant: DynamoNewApplicant = {
    PK: `${ENTITY_TYPES.APPLICANT}#${applicantId}`,
    SK: ENTITY_TYPES.APPLICANT,
    firstName: firstName,
    lastName: lastName,
    fullName: `${firstName} ${lastName}`, // TODO Dynamo sorts in lexigraphical order.. migth need to .uppercase() these
    email: email.toLowerCase().trim(),
    isemailVerified: false,
    orgId: orgId,
    applicantId: applicantId,
    entityType: ENTITY_TYPES.APPLICANT,
    createdAt: now,
    // TODO add phone number
    openingId: openingId,
    stageId: stageId,
    unsubscribeKey: nanoid(10),
    canReceiveEmails: true,
    // TODO Might need to be sharded on high volumes
    // Max seen is 75k per stage (on hold)
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
    GSI1SK: `DATE_LANDED#${now}`,
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
              SK: ENTITY_TYPES.OPENING,
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
              SK: ENTITY_TYPES.STAGE,
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
              SK: ENTITY_TYPES.ORG,
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
    return [newApplicant, null];
  } catch (error) {
    return [null, error];
  }
}
