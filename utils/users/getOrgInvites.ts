import { Dynamo } from "../../libs/ddbDocClient";
import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
const { DYNAMO_TABLE_NAME } = process.env;

import { GetUserById } from "./getUserById";

export async function GetOrgInvites(user_id: string) {
  const user = await GetUserById(user_id);

  if (!user)
    throw new Error("Unable to get latest invites, user does not exist");

  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
    ExpressionAttributeValues: {
      ":pk": `USER#${user.user_id}`,
      ":sk": "ORG_INVITE#",
    },
    ScanIndexForward: false,
    // Limit: 1, // TODO limit to latest 10 invites?
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return response.Items;
  } catch (error) {
    throw new Error(error);
  }
}
