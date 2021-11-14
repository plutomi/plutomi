import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import Time from "../time";
import { nanoid } from "nanoid";
import {
  ApplicantResponseEntry,
  CreateApplicantResponseInput,
  CreateApplicantResponseOutput,
} from "./types/ApplicantResponses";
import { EntityTypes } from "../../types/additional";

const { DYNAMO_TABLE_NAME } = process.env;

export async function createApplicantResponse(
  props: CreateApplicantResponseInput
): Promise<CreateApplicantResponseOutput> {
  const {
    orgId,
    applicantId,
    questionTitle,
    questionDescription,
    questionResponse,
  } = props;
  const now = Time.currentISO();
  const responseId = nanoid(30);
  const newApplicantResponse: ApplicantResponseEntry = {
    PK: `ORG#${orgId}#APPLICANT#${applicantId}`,
    SK: `${EntityTypes.APPLICANT_RESPONSE}#${responseId}`,
    orgId: orgId,
    applicantId: applicantId,
    entityType: EntityTypes.APPLICANT_RESPONSE,
    createdAt: now,
    responseId: responseId,
    questionTitle: questionTitle,
    questionDescription: questionDescription,
    questionResponse: questionResponse,
    GSI1PK: `ORG#${orgId}#APPLICANT#${applicantId}`,
    GSI1SK: EntityTypes.APPLICANT_RESPONSE, // TODO add timestmap?
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: newApplicantResponse,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await Dynamo.send(new PutCommand(params));

    return newApplicantResponse;
  } catch (error) {
    throw new Error(error);
  }
}
