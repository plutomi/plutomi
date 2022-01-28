import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ID_LENGTHS, ENTITY_TYPES, TIME_UNITS, DEFAULTS, OPENING_STATE } from "../../Config";
import { DynamoNewApplicant } from "../../types/dynamo";
import { CreateApplicantInput, CreateApplicantOutput } from "../../types/main";
import * as Time from "../../utils/time";
import { SdkError } from "@aws-sdk/types";
const { DYNAMO_TABLE_NAME } = process.env;

export default async function Create(
  props: CreateApplicantInput
): Promise<[CreateApplicantOutput, null] | [null, SdkError]> {
  const { orgId, firstName, lastName, email, openingId, stageId } = props;

  const now = Time.currentISO();
  const applicantId = nanoid(ID_LENGTHS.APPLICANT);

  const newApplicant: DynamoNewApplicant = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}#${applicantId}`,
    SK: ENTITY_TYPES.APPLICANT,
    firstName,
    lastName,
    email: email.toLowerCase().trim(),
    isEmailVerified: false,
    orgId,
    applicantId,
    entityType: ENTITY_TYPES.APPLICANT,
    createdAt: now,
    // TODO add phone number
    openingId,
    stageId,
    unsubscribeKey: nanoid(10),
    canReceiveEmails: true,
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
    GSI1SK: `DATE_LANDED#${now}`,
    // TODO add another GSI here for getting all applications by email
    // Fulfills searching easily and for the applicant portal
  };

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Add an applicant item
          Put: {
            Item: newApplicant,
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

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
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

            UpdateExpression:
              "SET totalApplicants = if_not_exists(totalApplicants, :zero) + :value",
            /**
             * Opening must exist, be public, & must have stages
             * Since this is a transaction, this whole thing will fail if this check fails
             */
            ConditionExpression:
              "attribute_exists(PK) AND GSI1SK = :GSI1SK AND totalStages > :totalStages",
            ExpressionAttributeValues: {
              ":zero": 0,
              ":value": 1,
              ":GSI1SK": OPENING_STATE.PUBLIC,
              ":totalStages": 0,
            },
          },
        },
        {
          // Increment the stage's total applicants
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
              SK: ENTITY_TYPES.STAGE,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

            ConditionExpression: "attribute_exists(PK)",
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
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

            ConditionExpression: "attribute_exists(PK)",
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
