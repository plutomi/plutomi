import { PutCommandInput, PutCommand } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ID_LENGTHS, ENTITY_TYPES, DEFAULTS, EMAILS } from "../../Config";
import { DynamoNewUser } from "../../types/dynamo";
import { CreateUserInput } from "../../types/main";
import sendEmail from "../../utils/sendEmail";
import * as Time from "../../utils/time";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
import genUnsubHash from "../../utils/genUnsubHash";
export default async function CreateUser(
  props: CreateUserInput
): Promise<[DynamoNewUser, null] | [null, SdkError]> {
  const { email, firstName, lastName } = props;

  const userId = nanoid(ID_LENGTHS.USER);

  const unsubscribeSecret = nanoid(10);
  const unsubscribeHash = genUnsubHash(userId, email, unsubscribeSecret);
  const newUser: DynamoNewUser = {
    PK: `${ENTITY_TYPES.USER}#${userId}`,
    SK: ENTITY_TYPES.USER,
    firstName: firstName || DEFAULTS.FIRST_NAME,
    lastName: lastName || DEFAULTS.LAST_NAME,
    email: email.toLowerCase().trim(),
    userId: userId,
    entityType: ENTITY_TYPES.USER,
    createdAt: Time.currentISO(),
    orgId: DEFAULTS.NO_ORG,
    orgJoinDate: DEFAULTS.NO_ORG,
    GSI1PK: `${ENTITY_TYPES.ORG}#${DEFAULTS.NO_ORG}#${ENTITY_TYPES.USER}S`,
    GSI1SK:
      firstName && lastName ? `${firstName} ${lastName}` : DEFAULTS.FULL_NAME,
    GSI2PK: email.toLowerCase().trim(),
    GSI2SK: ENTITY_TYPES.USER,
    unsubscribeSecret: unsubscribeSecret,
    unsubscribeHash: unsubscribeHash,
    canReceiveEmails: true,
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: newUser,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await Dynamo.send(new PutCommand(params));
    sendEmail({
      // TODO streams
      fromName: "New Plutomi User",
      fromAddress: EMAILS.GENERAL,
      toAddresses: ["contact@plutomi.com"], // TODO add var for default new user notifications
      subject: `A new user has signed up!`,
      html: `<h1>Email: ${newUser.email}</h1><h1>ID: ${newUser.userId}</h1>`,
    });
    return [newUser, null];
  } catch (error) {
    return [null, error];
  }
}
