import { Dynamo } from "../../libs/ddbDocClient";
import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param user_id - The email of the user base64url encoded
 */
export async function GetUserById(user_id: string) {
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `USER#${user_id}`,
      SK: `USER`,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));

    return response.Item;
  } catch (error) {
    throw new Error(error);
  }
}
