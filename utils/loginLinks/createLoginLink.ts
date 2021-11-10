import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { getCurrentTime, getPastOrFutureTime } from "../time";
import { Dynamo } from "../../awsClients/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;

export default async function createLoginLink({
  user,
  loginLinkHash,
  loginLinkExpiry,
}) {
  try {
    const now = getCurrentTime("iso") as string;
    const new_login_link = {
      PK: `USER#${user.userId}`,
      SK: `LOGIN_LINK#${now}`,
      loginLinkHash: loginLinkHash,
      userId: user.userId,
      entityType: "LOGIN_LINK",
      created_at: now,
      expiresAt: loginLinkExpiry,
      ttl_expiry: getPastOrFutureTime("future", 1, "days", "unix"),
    };

    const params: PutCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Item: new_login_link,
      ConditionExpression: "attribute_not_exists(PK)",
    };

    await Dynamo.send(new PutCommand(params));
    return;
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to create login link ${error}`);
  }
}
