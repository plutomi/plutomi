import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import Time from "../time";
import { nanoid } from "nanoid";
import { getUserByEmail } from "./getUserByEmail";
import { EMAILS, ENTITY_TYPES, ID_LENGTHS, PLACEHOLDERS } from "../../defaults";
import sendEmail from "../sendEmail";
const { DYNAMO_TABLE_NAME } = process.env;

export async function createUser(props) {
  const { email } = props;
  const user = await getUserByEmail(email);

  if (user) {
    return user;
  }
  const now = Time.currentISO();
  const userId = nanoid(ID_LENGTHS.USER);
  const newUser = {
    PK: `${ENTITY_TYPES.USER}#${userId}`,
    SK: ENTITY_TYPES.USER,
    firstName: PLACEHOLDERS.FIRST_NAME,
    lastName: PLACEHOLDERS.LAST_NAME,
    email: email.toLowerCase().trim(),
    userId: userId,
    entityType: ENTITY_TYPES.USER,
    createdAt: now,
    orgId: PLACEHOLDERS.NO_ORG,
    orgJoinDate: PLACEHOLDERS.NO_ORG,
    totalInvites: 0,
    GSI1PK: `${ENTITY_TYPES.ORG}#${PLACEHOLDERS.NO_ORG}#USERS`,
    GSI1SK: PLACEHOLDERS.FULL_NAME,
    GSI2PK: email.toLowerCase().trim(),
    GSI2SK: ENTITY_TYPES.USER,
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: newUser,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await Dynamo.send(new PutCommand(params));
    sendEmail({
      fromName: "New Plutomi User",
      fromAddress: EMAILS.GENERAL,
      toAddresses: ["contact@plutomi.com"],
      subject: `A new user has signed up!`,
      html: `<h1>Email: ${newUser.email}</h1><h1>ID: ${newUser.userId}</h1>`,
    });
    return newUser;
  } catch (error) {
    throw new Error(error);
  }
}
