import {
  GetCommand,
  GetCommandInput,
  GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;

// TODO
// TODO
// TODO
// TODO
// Major refactor needs to be done here
// Since each file / note will be in its own item, we want to query instead for all of an applicants items
// Then use groupBy to match those items to their corresponding entity type
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

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return response.Item;
  } catch (error) {
    throw new Error(error);
  }
}
