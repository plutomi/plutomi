import { Dynamo } from "../../libs/ddbDocClient";
import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
const { DYNAMO_TABLE_NAME } = process.env;
import { GetUserByEmail } from "../users/getUserByEmail";
import { GetCurrentTime } from "../time";

export async function GetLatestLoginCode(user_email: string) {
  const user = await GetUserByEmail(user_email);

  if (!user) throw new Error("Unable to get latest login code");

  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
    ExpressionAttributeValues: {
      ":pk": `USER#${user.user_id}`,
      ":sk": "LOGIN_CODE#",
    },
    ScanIndexForward: false,
    Limit: 1,
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    const latest_code = response.Items[0];
    return latest_code;
  } catch (error) {
    throw new Error(error);
  }
}
