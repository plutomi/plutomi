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
export async function CreateUser(
  name: string,
  email: string,
  password: string
) {
  const hashed_password = await CreatePassword(password);
  const now = dayjs().toISOString();
  const user_id = nanoid(30);
  const new_user = {
    PK: `USER#${user_id}`,
    SK: `USER`,
    name: name,
    email: email,
    password: hashed_password,
    entity_type: "USER",
    created_at: now,
    org_join_date: "NO_ORG_ASSIGNED",
    user_id: user_id,
    GSI1PK: "ORG#NO_ORG_ASSIGNED#USERS",
    GSI1SK: name,
    GSI2PK: email,
    GSI2SK: "USER",
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_user,
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return new_user;
  } catch (error) {
    throw new Error(error);
  }
}
