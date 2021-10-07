import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetUserByEmail } from "../users/getUserByEmail";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetUserById } from "../users/getUserById";

const { DYNAMO_TABLE_NAME } = process.env;
export async function GetLatestLoginLink(user_id: string) {
  const user = await GetUserById(user_id); // TODO this probably can get removed
  // Pretty sure we do checks before calling tet latest login link
  if (!user) {
    throw new Error("Invalid user_id");
  }
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
    ExpressionAttributeValues: {
      ":pk": `USER#${user.user_id}`,
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
