import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetCurrentTime, GetPastOrFutureTime } from "../time";
import { Dynamo } from "../../awsClients/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;

export default async function CreateLoginLink({
  user,
  loginLinkHash,
  login_link_expiry,
}) {
  try {
    const now = GetCurrentTime("iso") as string;
    const new_login_link = {
      PK: `USER#${user.userId}`,
      SK: `LOGIN_LINK#${now}`,
      loginLinkHash: loginLinkHash,
      userId: user.userId,
      entityType: "LOGIN_LINK",
      createdAt: now,
      expiresAt: login_link_expiry,
      ttl_expiry: GetPastOrFutureTime("future", 1, "days", "unix"),
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
