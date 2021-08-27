import { Dynamo } from "../../libs/ddbDocClient";
import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param org_id - The email of the org
 * @param funnel_id
 */
export async function GetFunnel(org_id: string, funnel_id: string) {
  /**
   * TODO: Permissions
   * When checking sessions, see if the org matches the user. If not, return a 403
   */
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${org_id}#FUNNEL#${funnel_id}`,
      SK: `FUNNEL`,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));

    return response.Item;
  } catch (error) {
    throw new Error(error);
  }
}
