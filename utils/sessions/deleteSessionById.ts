import { Dynamo } from "../../libs/ddbDocClient";
import { DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param session_id
 */

export async function DeleteSessionById(session_id: string) {
  const params: DeleteCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `SESSION#${session_id}`,
      SK: `SESSION#${session_id}`,
    },
  };

  try {
    await Dynamo.send(new DeleteCommand(params));
    return;
  } catch (error) {
    throw new Error(error);
  }
}
