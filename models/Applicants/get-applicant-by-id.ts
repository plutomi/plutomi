import { QueryCommandInput, QueryCommand } from "@aws-sdk/lib-dynamodb";
import _ from "lodash";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import {
  GetApplicantByIdInput,
  GetApplicantByIdOutput,
  CreateApplicantOutput,
} from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
export default async function Get(
  props: GetApplicantByIdInput
): Promise<[GetApplicantByIdOutput, null] | [null, SdkError]> {
  const { orgId, applicantId } = props;
  const responsesParams: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    KeyConditionExpression: "PK = :PK",
    ExpressionAttributeValues: {
      ":PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}#${applicantId}`,
    },
  };

  try {
    // TODO refactor for promise all / transact
    const allApplicantInfo = await Dynamo.send(
      new QueryCommand(responsesParams)
    );

    if (allApplicantInfo.Count === 0) {
      throw "Applicant not found";
    }

    if (allApplicantInfo?.Items?.length === 0) {
      throw new Error("Applicant not found");
    }

    const grouped = _.groupBy(allApplicantInfo.Items, "entityType");

    const metadata = grouped.APPLICANT[0] as CreateApplicantOutput;
    const responses = grouped.APPLICANT_RESPONSE;
    // TODO files

    const applicant: GetApplicantByIdOutput = {
      ...metadata,
      responses: responses,
      // TODO files
    };
    return [applicant, null]; // TODO TYPEs!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  } catch (error) {
    return [null, error];
  }
}
