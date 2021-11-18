import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import Time from "../time";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES, LOGIN_LINK_STATUS, TIME_UNITS } from "../../defaults";
import { CreateLoginLinkInput } from "../../types/main";
import { DynamoNewLoginLink } from "../../types/dynamo";

const { DYNAMO_TABLE_NAME } = process.env;

/**
 * Creates a login link for the requested user
 * @param props {@link CreateLoginLinkInput}
 * @returns
 */
export default async function createLoginLink(
  props: CreateLoginLinkInput
): Promise<void> {
  const { userId, loginLinkHash, loginLinkExpiry } = props;
  try {
    const now = Time.currentISO();
    const newLoginLink: DynamoNewLoginLink = {
      PK: `${ENTITY_TYPES.USER}#${userId}`,
      SK: `${ENTITY_TYPES.LOGIN_LINK}#${now}`,
      loginLinkHash: loginLinkHash,
      userId: userId,
      entityType: ENTITY_TYPES.LOGIN_LINK,
      linkStatus: LOGIN_LINK_STATUS.NEW, // TODO enum
      createdAt: now,
      expiresAt: loginLinkExpiry,
      ttlExpiry: Time.futureUNIX(1, TIME_UNITS.DAYS),
    };

    const params: PutCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Item: newLoginLink,
      ConditionExpression: "attribute_not_exists(PK)",
    };

    await Dynamo.send(new PutCommand(params));
    return;
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to create login link ${error}`);
  }
}
