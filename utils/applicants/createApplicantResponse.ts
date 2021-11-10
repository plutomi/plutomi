import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { getCurrentTime } from "../time";
import { nanoid } from "nanoid";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateApplicantResponse({
  orgId,
  applicantId,
  question_title,
  question_description,
  question_response,
}: CreateApplicantResponseInput) {
  const now = getCurrentTime("iso") as string;
  const response_id = nanoid(30);
  const new_applicant_response = {
    PK: `ORG#${orgId}#APPLICANT#${applicantId}`,
    SK: `APPLICANT_RESPONSE#${response_id}`,
    orgId: orgId,
    applicantId: applicantId,
    entityType: "APPLICANT_RESPONSE",
    created_at: now,
    response_id: response_id,
    question_title: question_title,
    question_description: question_description,
    question_response: question_response,
    GSI1PK: `ORG#${orgId}#APPLICANT#${applicantId}`,
    GSI1SK: `APPLICANT_RESPONSE`, // TODO add timestmap?
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_applicant_response,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await Dynamo.send(new PutCommand(params));

    return new_applicant_response;
  } catch (error) {
    throw new Error(error);
  }
}
