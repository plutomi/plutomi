import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import dayjs from "dayjs";
import base64url from "base64url";
import { CreatePassword } from "../passwords";
import { nanoid } from "nanoid";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param email - Email of user
 * @param name - Name of user as string, NOT base64url. Conversion happens in the function
 * @param password - User's desired password
 */
export async function CreateSession(user_id: string, email: string) {
  const now = dayjs().toISOString();
  const session_id = nanoid(50);
  const new_session = {
    PK: `USER#${user_id}`,
    SK: `USER_LOGIN#${now}`,
    email: email,
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
    return new_session;
  } catch (error) {
    throw new Error(error);
  }
}
