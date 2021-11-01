import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../lib/awsClients/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;
export async function GetLatestLoginLink(user_id: string) {
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
    ExpressionAttributeValues: {
      ":pk": `USER#${user_id}`,
      ":sk": "LOGIN_LINK",
    },
    ScanIndexForward: false,
    Limit: 1,
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    const latest_link = response.Items[0];
    return latest_link;
  } catch (error) {
    throw new Error(error);
  }
}
