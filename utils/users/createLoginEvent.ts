import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import Time from "../time";
import { getUserByEmail } from "../users/getUserByEmail";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { createUser } from "../users/createUser";
import { TimeUnits } from "../../types";

const { DYNAMO_TABLE_NAME } = process.env;

export default async function createLoginEvent(userId: string) {
  try {
    const now = Time.currentISO();
    const newLoginEvent = {
      PK: `USER#${userId}`,
      SK: `LOGIN_EVENT#${now}`,
      // TODO in the future, get all the info about the login event
      // Such as IP, headers, device, etc.
      createdAt: now,
      ttlExpiry: Time.futureUNIX(30, TimeUnits.DAYS),
    };

    const params: PutCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Item: newLoginEvent,
      ConditionExpression: "attribute_not_exists(PK)",
    };

    await Dynamo.send(new PutCommand(params));
  } catch (error) {
    throw new Error(`Unable to create login event ${error}`);
  }
}
