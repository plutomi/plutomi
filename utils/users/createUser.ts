import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";
import SendNewUserEmail from "../email/sendNewUser";
import { GetUserByEmail } from "./getUserByEmail";
const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateUser({ user_email }) {
  const user = await GetUserByEmail(user_email);

  if (user) {
    return user;
  }
  const now = GetCurrentTime("iso") as string;
  const user_id = nanoid(42);
  const new_user: DynamoUser = {
    PK: `USER#${user_id}`,
    SK: `USER`,
    first_name: "NO_FIRST_NAME",
    last_name: "NO_LAST_NAME",
    user_email: user_email.toLowerCase(),
    user_id: user_id,
    entity_type: "USER",
    created_at: now,
    org_id: "NO_ORG_ASSIGNED",
    org_join_date: "NO_ORG_ASSIGNED",
    //-- total_invites: 0,
    GSI1PK: "ORG#NO_ORG_ASSIGNED#USERS",
    GSI1SK: `NO_FIRST_NAME NO_LAST_NAME`,
    GSI2PK: user_email.toLowerCase(),
    GSI2SK: "USER",
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_user,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await Dynamo.send(new PutCommand(params));
    SendNewUserEmail(new_user);
    return new_user;
  } catch (error) {
    throw new Error(error);
  }
}
