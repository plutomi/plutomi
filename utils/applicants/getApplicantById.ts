import {
  GetCommand,
  GetCommandInput,
  GetCommandOutput,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../lib/awsClients/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;
import _ from "lodash";

export async function GetApplicantById(orgId: string, applicant_id: string) {
  const responsesParams: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    KeyConditionExpression: "PK = :PK AND begins_with(SK, :SK)",
    ExpressionAttributeValues: {
      ":PK": `ORG#${orgId}#APPLICANT#${applicant_id}`,
      ":SK": `APPLICANT`,
    },
  };

  try {
    // TODO refactor for promise all / transact
    const all_applicant_info = await Dynamo.send(
      new QueryCommand(responsesParams)
    );

    if (all_applicant_info.Items.length == 0) {
      throw `Applicant not found`;
    }

    const grouped = _.groupBy(all_applicant_info.Items, "entityType");
    const metadata = grouped.APPLICANT[0]; // An array of 1 item, always. No two applicants will have the same ID
    // TODO there is a check here to see if grouped has property of applicant, if not applicant does not exist and we forgot to delete other children (like responses, files, etc.)
    const responses = grouped.APPLICANT_RESPONSE; // Array of applicant responses

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
