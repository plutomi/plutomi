import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import Time from "../time";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES, TIME_UNITS } from "../../defaults";
import { CreateLoginEventInput } from "../../types/main";
import { DynamoNewLoginEvent } from "../../types/dynamo";

const { DYNAMO_TABLE_NAME } = process.env;

/**
 * Creates a {@link ENTITY_TYPES.LOGIN_EVENT} for the user
 * @param userId - The id of the user
 */
export default async function createLoginEvent(
  props: CreateLoginEventInput
): Promise<void> {
  const { userId } = props;
  try {
    const now = Time.currentISO();
    const newLoginEvent: DynamoNewLoginEvent = {
      PK: `${ENTITY_TYPES.USER}#${userId}`, // TODO set login events as org events if the user has an org
      SK: `${ENTITY_TYPES.LOGIN_EVENT}#${now}`,
      // TODO in the future, get all the info about the login event
      // Such as IP, headers, device, etc.
      createdAt: now,
      ttlExpiry: Time.futureUNIX(30, TIME_UNITS.DAYS),
    };

    const params: PutCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Item: newLoginEvent,
      ConditionExpression: "attribute_not_exists(PK)",
    };

    await Dynamo.send(new PutCommand(params));
    return;
  } catch (error) {
    throw new Error(`Unable to create login event ${error}`);
  }
}
