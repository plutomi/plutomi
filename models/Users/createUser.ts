import { PutCommandInput, PutCommand } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ID_LENGTHS, ENTITY_TYPES, DEFAULTS, EMAILS } from "../../Config";
import { DynamoNewUser } from "../../types/dynamo";
import { CreateUserInput } from "../../types/main";
import * as Time from "../../utils/time";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
import { sealData } from "iron-session";
export default async function CreateUser(
  props: CreateUserInput
): Promise<[DynamoNewUser, null] | [null, SdkError]> {
  const { email, firstName, lastName } = props;

  const userId = nanoid(ID_LENGTHS.USER);

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
    totalInvites: 0, // TODO when creating an invite, a user is created. We should set this to 1!
    orgJoinDate: DEFAULTS.NO_ORG,
    GSI1PK: `${ENTITY_TYPES.ORG}#${DEFAULTS.NO_ORG}#${ENTITY_TYPES.USER}S`,
    GSI1SK:
      firstName && lastName
        ? `${firstName} ${lastName}`
        : `${DEFAULTS.FIRST_NAME} ${DEFAULTS.LAST_NAME}`,
    GSI2PK: email.toLowerCase().trim(),
    GSI2SK: ENTITY_TYPES.USER,
    unsubscribeKey: nanoid(10),
    canReceiveEmails: true,
    verifiedEmail: false,
  };

  const params: PutCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

    Item: newUser,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return [newUser, null];
  } catch (error) {
    return [null, error];
  }
}
