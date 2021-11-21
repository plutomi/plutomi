import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;
import _ from "lodash";
import {
  CreateApplicantOutput,
  GetApplicantByIdInput,
  GetApplicantByIdOutput,
} from "../../types/main";
import { ENTITY_TYPES } from "../../Config";

/**
 * Get an applicant by their ID
 * @param props - {@link GetApplicantByIdInput}
 * @returns An applicant's metadata and responses
 */
export async function getApplicantById(
  props: GetApplicantByIdInput
): Promise<GetApplicantByIdOutput> {
  const { orgId, applicantId } = props;
  const responsesParams: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    KeyConditionExpression: "PK = :PK AND begins_with(SK, :SK)",
    ExpressionAttributeValues: {
      ":PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}#${applicantId}`,
      ":SK": `${ENTITY_TYPES.APPLICANT}`,
    },
  };

  try {
    // TODO refactor for promise all / transact
    const allApplicantInfo = await Dynamo.send(
      new QueryCommand(responsesParams)
    );

    const grouped = _.groupBy(allApplicantInfo.Items, "entityType");

    const metadata = grouped.APPLICANT[0] as CreateApplicantOutput;
    const responses = grouped.APPLICANT_RESPONSE;
    // TODO files

    const applicant: GetApplicantByIdOutput = {
      ...metadata,
      responses: responses,
      // TODO files
    };
    return applicant; // TODO TYPE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  } catch (error) {
    throw new Error(error);
  }
}
