import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";
import sendNewUserEmail from "../email/sendNewUser";
import { getUserByEmail } from "./getUserByEmail";
const { DYNAMO_TABLE_NAME } = process.env;

export async function createUser({ userEmail }) {
  const user = await getUserByEmail(userEmail);

  if (user) {
    return user;
  }
  const now = GetCurrentTime("iso") as string;
  const userId = nanoid(42);
  const newUser = {
    PK: `USER#${userId}`,
    SK: `USER`,
    firstName: "NO_FIRST_NAME",
    lastName: "NO_LAST_NAME",
    userEmail: userEmail.toLowerCase().trim(),
    userId: userId,
    entityType: "USER",
    createdAt: now,
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
    Item: newUser,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await Dynamo.send(new PutCommand(params));
    sendNewUserEmail(newUser); // TODO async with streams
    return newUser;
  } catch (error) {
    throw new Error(error);
  }
}
