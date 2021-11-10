import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetCurrentTime, GetPastOrFutureTime } from "../time";
import { GetUserByEmail } from "../users/getUserByEmail";
import { Dynamo } from "../../lib/awsClients/ddbDocClient";
import { CreateUser } from "../users/createUser";

const { DYNAMO_TABLE_NAME } = process.env;

export default async function CreateLoginEvent(userId: string) {
  try {
    const now = GetCurrentTime("iso") as string;
    const new_login_event = {
      PK: `USER#${userId}`,
      SK: `LOGIN_EVENT#${now}`,
      // TODO in the future, get all the info about the login event
      // Such as IP, headers, device, etc.
      createdAt: now,
      ttl_expiry: GetPastOrFutureTime("future", 30, "days", "unix"),
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
