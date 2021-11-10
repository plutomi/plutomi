import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../lib/awsClients/ddbDocClient";
import { getCurrentTime } from "../time";
import { nanoid } from "nanoid";
import SendNewUserEmail from "../email/sendNewUser";
import { getUserByEmail } from "./getUserByEmail";
const { DYNAMO_TABLE_NAME } = process.env;

/**
 *
 * @param userEmail Email of the user to create
 * @param firstName - Optional, defaults to NO_FIRST_NAME
 * @param lastName - Optional, defaults to NO_LAST_NAME
 * @returns - The newly created user, or if a user exists
 */
export async function createUser(
  userEmail: string,
  firstName?: string,
  lastName?: string
) {
  const now = getCurrentTime("iso") as string;
  const userId = nanoid(42);
  const new_user = {
    PK: `USER#${userId}`,
    SK: `USER`,
    firstName: firstName || "NO_FIRST_NAME",
    lastName: lastName || "NO_LAST_NAME",
    userEmail: userEmail.toLowerCase().trim(),
    userId: userId,
    entityType: "USER",
    created_at: now,
    orgId: "NO_ORG_ASSIGNED",
    orgJoinDate: "NO_ORG_ASSIGNED",
    totalInvites: 0,
    GSI1PK: "ORG#NO_ORG_ASSIGNED#USERS",
    GSI1SK: `NO_FIRST_NAME NO_LAST_NAME`,
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
