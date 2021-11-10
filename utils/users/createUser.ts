import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../lib/awsClients/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";
import SendNewUserEmail from "../email/sendNewUser";
import { GetUserByEmail } from "./getUserByEmail";
const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateUser({ userEmail }) {
  const user = await GetUserByEmail(userEmail);

  if (user) {
    return user;
  }
  const now = GetCurrentTime("iso") as string;
  const userId = nanoid(42);
  const new_user: DynamoUser = {
    PK: `USER#${userId}`,
    SK: `USER`,
    firstName: "NO_firstName",
    lastName: "NO_lastName",
    userEmail: userEmail.toLowerCase().trim(),
    userId: userId,
    entity_type: "USER",
    created_at: now,
    orgId: "NO_ORG_ASSIGNED",
    org_join_date: "NO_ORG_ASSIGNED",
    total_invites: 0,
    GSI1PK: "ORG#NO_ORG_ASSIGNED#USERS",
    GSI1SK: `NO_firstName NO_lastName`,
    GSI2PK: userEmail.toLowerCase().trim(),
    GSI2SK: "USER",
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_user,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await Dynamo.send(new PutCommand(params));
    SendNewUserEmail(new_user); // TODO async with streams
    return new_user;
  } catch (error) {
    throw new Error(error);
  }
}
