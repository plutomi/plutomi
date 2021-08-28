import { Dynamo } from "../../libs/ddbDocClient";
import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetPastOrFutureTime } from "../time";
import { BlockedLoginAttempt } from "./createBlockedLogin";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param user_email
 */

const max_password_attempts = 2;
export async function GetLatestFailedLogins(user_email: string) {
  const time_barrier = GetPastOrFutureTime("past", 1, "hours", "iso");
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK AND GSI1SK >= :GSI1SK",
    ExpressionAttributeValues: {
      ":GSI1PK": user_email,
      ":GSI1SK": `USER_LOGIN_ATTEMPT#${time_barrier}`,
    },
    Limit: max_password_attempts,
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    if (response.Items.length >= max_password_attempts) {
      await BlockedLoginAttempt(user_email);
      throw new Error("You are doing that too much, please try again later");
    }
    return;
  } catch (error) {
    throw new Error(error);
  }
}
