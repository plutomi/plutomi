import { Dynamo } from "../../libs/ddbDocClient";
import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
const { DYNAMO_TABLE_NAME, GSI2_INDEX } = process.env;
/**
 *
 * @param email - Email of user
 */
export async function GetUserByEmail(email: string) {
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: GSI2_INDEX,
    KeyConditionExpression: "GSI2PK = :pk AND GSI2SK = :sk",
    ExpressionAttributeValues: {
      ":pk": email,
      ":sk": email,
    },
    Limit: 1,
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));

    return response.Items[0];
  } catch (error) {
    throw new Error(error);
  }
}
