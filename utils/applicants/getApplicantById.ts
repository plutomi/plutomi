import {
  GetCommand,
  GetCommandInput,
  GetCommandOutput,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;
import _ from "lodash";

export async function GetApplicantById({
  orgId,
  applicantId,
}: GetApplicantInput) {
  const responsesParams: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    KeyConditionExpression: "PK = :PK AND begins_with(SK, :SK)",
    ExpressionAttributeValues: {
      ":PK": `ORG#${orgId}#APPLICANT#${applicantId}`,
      ":SK": `APPLICANT`,
    },
  };

  try {
    // TODO refactor for promise all / transact
    const allApplicantInfo = await Dynamo.send(
      new QueryCommand(responsesParams)
    );

    const grouped = _.groupBy(allApplicantInfo.Items, "entityType");

    const metadata = grouped.APPLICANT[0];
    const responses = grouped.APPLICANT_RESPONSE;
    // TODO files

    const applicant = {
      ...metadata,
      responses: responses,
      // TODO files
    };
    return applicant;
  } catch (error) {
    throw new Error(error);
  }
}
