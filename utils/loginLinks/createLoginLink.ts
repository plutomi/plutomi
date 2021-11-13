import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetCurrentTime, GetPastOrFutureTime } from "../time";
import { Dynamo } from "../../awsClients/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;

export default async function createLoginLink({
  user,
  loginLinkHash,
  loginLinkExpiry,
}) {
  try {
    const now = GetCurrentTime("iso") as string;
    const newLoginLink = {
      PK: `USER#${user.userId}`,
      SK: `loginLink#${now}`,
      loginLinkHash: loginLinkHash,
      userId: user.userId,
      entityType: "loginLink",
      createdAt: now,
      expiresAt: loginLinkExpiry,
      ttlExpiry: GetPastOrFutureTime("future", 1, "days", "unix"),
    };

    const params: PutCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Item: newLoginLink,
      ConditionExpression: "attribute_not_exists(PK)",
    };

    await Dynamo.send(new PutCommand(params));
    return;
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to create login link ${error}`);
  }
}
