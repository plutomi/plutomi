import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetUserByEmail } from "./getUserByEmail";
import { GetCurrentTime } from "../time";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param user_email - Email of user
 */
export async function FailedLoginAttempt(user_email: string) {
  const user = await GetUserByEmail(user_email);

  if (!user) {
    throw new Error("User does not exist, unable to create login attempt");
  }

  const { user_id } = user;
  const current_time = GetCurrentTime("iso");

  // Create a session and create a LOGIN event on the user
  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: {
      PK: `USER#${user_id}`,
      SK: `USER_LOGIN_ATTEMPT#${current_time}`, // TODO add TTL expiry???
      entity_type: "LOGIN_ATTEMPT",
      created_at: current_time,
      user_id: user_id,
      GSI1PK: user_email,
      GSI1SK: `USER_LOGIN_ATTEMPT#${current_time}`,
    },
    ConditionExpression: "attribute_not_exists(PK)", // Shouldn't be needed
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return;
  } catch (error) {
    throw new Error(error);
  }
}
