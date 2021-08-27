import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import dayjs from "dayjs";
import base64url from "base64url";
import { CreatePassword } from "../passwords";
import { nanoid } from "nanoid";
import { GetUserByEmail } from "../users/getUserByEmail";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param user_email - Email of user
 */
export async function CreateSession(user_email: string) {
  const user = await GetUserByEmail(user_email);

  if (!user) {
    throw new Error("User does not exist, unable to create session");
  }

  const { user_id } = user;
  const now = dayjs().toISOString();
  const session_id = nanoid(50);
  const new_session = {
    PK: `USER#${user_id}`,
    SK: `USER_LOGIN#${now}`,
    email: user_email,
    entity_type: "LOGIN",
    created_at: now,
    user_id: user_id,
    session_status: `ACTIVE`,
    GSI1PK: `SESSION#${session_id}`,
    GSI1SK: `SESSION#${session_id}`,
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_session,
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return session_id;
  } catch (error) {
    throw new Error(error);
  }
}
