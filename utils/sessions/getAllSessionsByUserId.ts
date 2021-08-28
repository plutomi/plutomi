import { Dynamo } from "../../libs/ddbDocClient";
import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
const { DYNAMO_TABLE_NAME } = process.env;

/**
 * @param user_id
 */
export async function GetAllSessionsByUserId(user_id: string) {
  // TODO loop until all items returned OR limit the number of concurrent sessions
  // TODO to make sure they can be retrieved in one request
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK AND begins_with(GSI1SK, :GSI1SK)",
    ExpressionAttributeValues: {
      ":GSI1PK": `USER#${user_id}#SESSIONS`,
      ":GSI1SK": `created_at`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return response.Items;
  } catch (error) {
    throw new Error(error);
  }
}
