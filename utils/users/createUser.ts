import { Dynamo } from "../../libs/ddbDocClient";
import {
  PutCommand,
  PutCommandInput,
  UpdateCommandInput,
  GetCommand,
  GetCommandInput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import dayjs from "dayjs";

const { DYNAMO_TABLE_NAME, ID_LENGTH } = process.env;
/**
 *
 * @param email
 * @param name
 */
export async function CreateUser(email: string, name: string) {
  const now = dayjs().toISOString();
  const user_id = nanoid(parseInt(ID_LENGTH));
  const params: PutCommandInput = {
    TableName: process.env.DYNAMO_TABLE_NAME,
    Item: {
      PK: `USER#${user_id}`,
      SK: `USER#${user_id}`,
      email: email,
      name: name,
      entity_type: "USER",
      created_at: now,
      org: "NO_ORG_ASSIGNED",
      org_name: "NO_ORG_ASSIGNED",
      org_join_date: "NO_ORG_ASSIGNED",
      user_role: "BASIC",
      user_id: user_id,
      GSI1PK: "ORG#NO_ORG_ASSIGNED",
      GSI1SK: `USER#${email}`,
      is_sub_user: false,
    },
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return params.Item;
  } catch (error) {
    throw new Error("An error ocurred creating your user");
  }
}
