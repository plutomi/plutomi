import { Dynamo } from "../../libs/ddbDocClient";
import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param org_id
 * @param stage_id
 */
export async function GetStage({ org_id, stage_id }) {
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${org_id}#STAGE#${stage_id}`,
      SK: `STAGE`,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return response.Item;
  } catch (error) {
    throw new Error(error);
  }
}
