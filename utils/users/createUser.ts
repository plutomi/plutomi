import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { CreatePassword } from "../passwords";
import { nanoid } from "nanoid";
import { GetUserByEmail } from "./getUserByEmail";
import { GetCurrentTime } from "../time";

const { DYNAMO_TABLE_NAME } = process.env;

/**
 * @param first_name
 * @param last_name
 * @param user_email
 * @param password
 */
export async function CreateUser({
  first_name,
  last_name,
  user_email,
  password,
}: CreateUserInput) {
  const userExists = await GetUserByEmail(user_email);
  if (userExists)
    throw new Error(
      "A user already exists with this email, please log in instead" // TODO maybe login the user if the password is correct?
    );

  const hashed_password = await CreatePassword(password);
  const now = GetCurrentTime("iso");
  const user_id = nanoid(30);
  const new_user = {
    PK: `USER#${user_id}`,
    SK: `USER`,
    first_name: first_name,
    last_name: last_name,
    user_email: user_email,
    user_id: user_id,
    password: hashed_password,
    entity_type: "USER",
    created_at: now,
    org_url_name: "NO_ORG_ASSIGNED",
    org_join_date: "NO_ORG_ASSIGNED",
    GSI1PK: "ORG#NO_ORG_ASSIGNED#USERS",
    GSI1SK: `${first_name} ${last_name}`,
    GSI2PK: user_email,
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
