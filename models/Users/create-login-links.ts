import { PutCommandInput, PutCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { DYNAMO_TABLE_NAME, ENTITY_TYPES, TIME_UNITS } from "../../Config";
import { DynamoLoginLink } from "../../types/dynamo";
import { CreateLoginLinkInput } from "../../types/main";
import * as Time from "../../utils/time";
import { SdkError } from "@aws-sdk/types";

/**
 * Creates a login link for the requested user
 * @param props {@link CreateLoginLinkInput}
 * @returns
 */
export default async function CreateLoginLink(
  props: CreateLoginLinkInput
): Promise<[null, SdkError]> {
  const { loginLinkId, loginLinkUrl, loginLinkExpiry, user } = props;
  const now = Time.currentISO();
  try {
    const newLoginLink: DynamoLoginLink = {
      PK: `${ENTITY_TYPES.USER}#${user.userId}`,
      SK: `${ENTITY_TYPES.LOGIN_LINK}#${loginLinkId}`,
      loginLinkUrl,
      relativeExpiry: Time.relative(new Date(loginLinkExpiry)),
      user,
      entityType: ENTITY_TYPES.LOGIN_LINK,
      createdAt: now,
      ttlExpiry: Time.futureUNIX(15, TIME_UNITS.MINUTES), // Deleted after 15 minutes
      GSI1PK: `${ENTITY_TYPES.USER}#${user.userId}#${ENTITY_TYPES.LOGIN_LINK}S`, // Get latest login link(s) for a user for throttling
      GSI1SK: now,
    };

    const params: PutCommandInput = {
      TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
      Item: newLoginLink,
      ConditionExpression: "attribute_not_exists(PK)",
    };

    await Dynamo.send(new PutCommand(params));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
