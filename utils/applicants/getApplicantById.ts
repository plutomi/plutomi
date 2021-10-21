import {
  GetCommand,
  GetCommandInput,
  GetCommandOutput,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;

// Major refactor needs to be done here
// TODO we should transact for each item type and query untill all items are returned
// For example, get applicant metadata
// Get applicant responses / files
// Get applicant history
export async function GetApplicantById({
  org_id,
  applicant_id,
}: GetApplicantInput) {
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${org_id}#APPLICANT#${applicant_id}`,
      SK: `APPLICANT`,
    },
  };

  const responsesParams: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    KeyConditionExpression: "PK = :PK AND begins_with(SK, :SK)",
    ExpressionAttributeValues: {
      ":PK": `ORG#${org_id}#APPLICANT#${applicant_id}`,
      ":SK": `APPLICANT_RESPONSE`,
    },
  };

  try {
    // TODO refactor for promise all
    const metadata = await Dynamo.send(new GetCommand(params));
    const responses = await Dynamo.send(new QueryCommand(responsesParams));

    const response = {
      ...metadata.Item,
      responses: responses.Items,
    };
    return response;
  } catch (error) {
    throw new Error(error);
  }
}
