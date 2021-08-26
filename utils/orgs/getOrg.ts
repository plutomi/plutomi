import { Dynamo } from "../../libs/ddbDocClient";
import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param org_id - The email of the org
 */
export async function GetOrg(org_id: string) {
  /**
   * TODO: Permissions
   * When checking sessions, see if the org matches the user. If not, return a 403
   */
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
