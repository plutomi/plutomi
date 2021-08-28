import { Dynamo } from "../../libs/ddbDocClient";
import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { GetUserByEmail } from "../users/getUserByEmail";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param user_email - Email of user
 */
export async function Login(user_email: string) {
  const user = await GetUserByEmail(user_email);

  if (!user) {
    throw new Error("User does not exist, unable to create session");
  }

  const now = dayjs();
  const { user_id } = user;
  const current_time = now.toISOString();
  const session_duration = now.add(7, "days").unix();
  const session_id = nanoid(50);

  console.log("Expires", session_duration);
  // Create a session and create a LOGIN event on the user
  const params: TransactWriteCommandInput = {
    TransactItems: [
      {
        Put: {
          // Login event
          TableName: DYNAMO_TABLE_NAME,
          Item: {
            PK: `USER#${user_id}`,
            SK: `USER_LOGIN#${now}`, // TODO add TTL expiry???
            entity_type: "LOGIN",
            created_at: current_time,
            user_id: user_id,
          },
          ConditionExpression: "attribute_not_exists(PK)", // Shouldn't be needed
        },
      },
      {
        Put: {
          // Session
          TableName: DYNAMO_TABLE_NAME,
          Item: {
            PK: `SESSION#${session_id}`,
            SK: `SESSION#${session_id}`,
            GSI1PK: `USER#${user_id}#SESSIONS`,
            GSI1SK: `created_at#${current_time}`,
            ttl_expiry: session_duration,
            user_id: user_id,
          },
          ConditionExpression: "attribute_not_exists(PK)",
        },
      },
    ],
  };

  try {
    await Dynamo.send(new TransactWriteCommand(params));
    return session_id;
  } catch (error) {
    throw new Error(error);
  }
}
