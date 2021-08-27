import { Dynamo } from "../../libs/ddbDocClient";
import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param session_id
 */

export async function GetSessionById(session_id: string) {
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK AND GSI1SK = :GSI1SK",
    ExpressionAttributeValues: {
      ":GSI1PK": `SESSION#${session_id}`,
      ":GSI1SK": `SESSION#${session_id}`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return response.Items[0];
  } catch (error) {
    throw new Error(error);
  }
}
