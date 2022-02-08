import { PutCommandInput, PutCommand } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ID_LENGTHS, ENTITY_TYPES, DYNAMO_TABLE_NAME } from "../../Config";
import { DynamoApplicantResponse } from "../../types/dynamo";
import {
  CreateApplicantResponseInput,
  CreateApplicantResponseOutput,
} from "../../types/main";
import * as Time from "../../utils/time";
import { SdkError } from "@aws-sdk/types";
export default async function CreateResponse(
  props: CreateApplicantResponseInput
): Promise<[CreateApplicantResponseOutput, null] | [null, SdkError]> {
  const { orgId, applicantId, questionTitle, description, questionResponse } =
    props;
  const responseId = nanoid(ID_LENGTHS.APPLICANT_RESPONSE);
  const newApplicantResponse: DynamoApplicantResponse = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}#${applicantId}`,
    SK: `${ENTITY_TYPES.APPLICANT_RESPONSE}#${responseId}`,
    orgId,
    applicantId,
    entityType: ENTITY_TYPES.APPLICANT_RESPONSE,
    createdAt: Time.currentISO(),
    responseId,
    questionTitle,
    description,
    questionResponse,
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}#${applicantId}`,
    GSI1SK: ENTITY_TYPES.APPLICANT_RESPONSE, // TODO add timestmap?
  };

  const params: PutCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    Item: newApplicantResponse,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return [newApplicantResponse, null];
  } catch (error) {
    return [null, error];
  }
}
