import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { GetUserByEmail } from "./getUserByEmail";
import { GetCurrentTime } from "../time";

const { DYNAMO_TABLE_NAME } = process.env;

/**
 * @param first_name
 * @param last_name
 * @param user_email
 */
export async function CreateUser({
  first_name,
  last_name,
  user_email,
}: CreateUserInput) {

  const now = GetCurrentTime("iso");
  const user_id = nanoid(30);
  const new_user = {
    PK: `USER#${user_id}`,
    SK: `USER`,
    first_name: first_name || "NO FIRST NAME",
    last_name: last_name || "NO LAST NAME",
    user_email: user_email,
    user_id: user_id,
    entity_type: "USER",
    created_at: now,
    org_id: "NO_ORG_ASSIGNED",
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
