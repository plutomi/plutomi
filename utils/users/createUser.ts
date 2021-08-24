import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import dayjs from "dayjs";

const { DYNAMO_TABLE_NAME, ID_LENGTH } = process.env;
/**
 *
 * @param email - Email of user
 * @param name - Name of user
 */
export async function CreateUser(name: string, email: string) {
  const now = dayjs().toISOString();
  const user_id = nanoid(parseInt(ID_LENGTH));
  const new_user: NewUserOutput = {
    PK: `USER#${user_id}`,
    SK: `USER#${user_id}`,
    email: email,
    name: name,
    password: nanoid(10), // TODO add option to choose your own password
    entity_type: "USER",
    created_at: now,
    org: "NO_ORG_ASSIGNED",
    org_join_date: "NO_ORG_ASSIGNED",
    user_role: "BASIC",
    user_id: user_id,
    GSI1PK: "ORG#NO_ORG_ASSIGNED",
    GSI1SK: `USER#${name}`,
    is_sub_user: false,
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_user,
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return params.Item;
  } catch (error) {
    throw new Error(error);
  }
}
