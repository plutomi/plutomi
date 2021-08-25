import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import { CreatePassword } from "../passwords";
const { DYNAMO_TABLE_NAME, ID_LENGTH } = process.env;
/**
 *
 * @param email - Email of user
 * @param name - Name of user
 * @param password - User's desired password
 */
export async function CreateUser(
  name: string,
  email: string,
  password: string
) {
  const hashed_password = await CreatePassword(password);
  const now = dayjs().toISOString();
  const user_id = nanoid(parseInt(ID_LENGTH));
  const new_user: NewUserOutput = {
    PK: `USER#${user_id}`,
    SK: `USER#${user_id}`,
    email: email,
    name: name,
    password: hashed_password,
    entity_type: "USER",
    created_at: now,
    org: "NO_ORG_ASSIGNED",
    org_join_date: "NO_ORG_ASSIGNED",
    user_role: "BASIC",
    user_id: user_id,
    GSI1PK: "ORG#NO_ORG_ASSIGNED",
    GSI1SK: `USER#${name}`,
    GSI2PK: email, // Get users by email (invites, passwords)
    GSI2SK: email,
    is_sub_user: false,
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_user,
  };

  try {
    await Dynamo.send(new PutCommand(params));
    const { password, ...returned_user } = new_user;
    return returned_user;
  } catch (error) {
    throw new Error(error);
  }
}
