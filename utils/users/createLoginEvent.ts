import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { getCurrentTime, getPastOrFutureTime } from "../time";
import { getUserByEmail } from "../users/getUserByEmail";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { createUser } from "../users/createUser";

const { DYNAMO_TABLE_NAME } = process.env;

export default async function CreateLoginEvent(userId: string) {
  try {
    const now = getCurrentTime("iso") as string;
    const new_login_event = {
      PK: `USER#${userId}`,
      SK: `LOGIN_EVENT#${now}`,
      // TODO in the future, get all the info about the login event
      // Such as IP, headers, device, etc.
      created_at: now,
      ttl_expiry: getPastOrFutureTime("future", 30, "days", "unix"),
    };

    const params: PutCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Item: new_login_event,
      ConditionExpression: "attribute_not_exists(PK)",
    };

    await Dynamo.send(new PutCommand(params));
  } catch (error) {
    throw new Error(`Unable to create login event ${error}`);
  }
}
