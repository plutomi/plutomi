import { Dynamo } from "../../libs/ddbDocClient";
import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 * @param org_id
 */
export async function GetOrg(org_id: string) {
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${org_id}`,
      SK: `ORG`,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return response.Item;
  } catch (error) {
    throw new Error(error);
  }
}
