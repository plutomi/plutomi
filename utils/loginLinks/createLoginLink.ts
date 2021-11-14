import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import Time from "../time";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { TimeUnits } from "../../types/additional";

const { DYNAMO_TABLE_NAME } = process.env;

export default async function createLoginLink({
  user,
  loginLinkHash,
  loginLinkExpiry,
}) {
  try {
    const now = Time.currentISO();
    const newLoginLink = {
      PK: `USER#${user.userId}`,
      SK: `loginLink#${now}`,
      loginLinkHash: loginLinkHash,
      userId: user.userId,
      entityType: "LOGIN_LINK",
      createdAt: now,
      expiresAt: loginLinkExpiry,
      ttlExpiry: Time.futureUNIX(1, TimeUnits.DAYS),
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
