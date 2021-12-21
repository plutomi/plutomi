import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { SdkError } from "@aws-sdk/types";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES, DEFAULTS, TIME_UNITS } from "../../Config";
import { DynamoNewLoginEvent } from "../../types/dynamo";
import { CreateLoginEventAndDeleteLoginLinkInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import * as Time from "../../utils/time";
/**
 * Creates a login event on the user
 * Deletes the login link they used to log in so they can login again or on another device
 * If `orgId` is provided, it will also create a `LOGIN_EVENT` on the org
 * @param props
 * @returns
 */
export default async function CreateLoginEvent(
  props: CreateLoginEventAndDeleteLoginLinkInput
): Promise<[null, null] | [null, SdkError]> {
  const { userId, loginLinkId, orgId, email, verifiedEmail } = props;

  const now = Time.currentISO();

  const newUserLoginEvent: DynamoNewLoginEvent = {
    PK: `${ENTITY_TYPES.USER}#${userId}`,
    SK: `${ENTITY_TYPES.LOGIN_EVENT}#${now}`,
    userId: userId,
    email: email,
    entityType: ENTITY_TYPES.LOGIN_EVENT,
    /**
     * Whenever a user logs in, a background process is triggerred to notify
     * the app admin that a new user has signed up if the below is false
     */
    verifiedEmail: verifiedEmail,
    // TODO in the future, get more the info about the login event such as IP, headers, device, etc.
    createdAt: now,
    ttlExpiry: Time.futureUNIX(
      DEFAULTS.LOGIN_EVENT_RETENTION_PERIOD,
      TIME_UNITS.DAYS
    ),
  };

  const newOrgLoginEvent = {
    // TODO types
    PK: `${ENTITY_TYPES.ORG}#${orgId}`,
    SK: `${ENTITY_TYPES.LOGIN_EVENT}#${now}`,
    // TODO user info here
    // TODO in the future, get more the info about the login event such as IP, headers, device, etc.
    createdAt: now,
    ttlExpiry: Time.futureUNIX(
      DEFAULTS.LOGIN_EVENT_RETENTION_PERIOD,
      TIME_UNITS.DAYS
    ),
  };

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Create a login event on the user
          Put: {
            Item: newUserLoginEvent,
            TableName: DYNAMO_TABLE_NAME,
            ConditionExpression: "attribute_not_exists(PK)",
          },
        },

        {
          // Delete the link used to login
          Delete: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${userId}`,
              SK: `${ENTITY_TYPES.LOGIN_LINK}#${loginLinkId}`,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },
      ],
    };
    // If a user has an orgId, create a login event on the org as well
    orgId ??
      transactParams.TransactItems.push({
        // Create a login event on the org
        Put: {
          Item: newOrgLoginEvent,
          TableName: DYNAMO_TABLE_NAME,
          ConditionExpression: "attribute_not_exists(PK)",
        },
      });
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
