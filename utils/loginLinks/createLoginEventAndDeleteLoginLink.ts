import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import Time from "../time";
import { ENTITY_TYPES, ID_LENGTHS, TIME_UNITS } from "../../defaults";
import { DynamoNewApplicant, DynamoNewLoginEvent } from "../../types/dynamo";
import { CreateLoginEventAndDeleteLoginLinkInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;

/**
 * Creates a login event on the user
 * Deletes the login link they used to log in so they can login again or on another device
 * If `orgId` is provided, it will also create a `LOGIN_EVENT` on the org
 * @param props
 * @returns
 */
export async function createLoginEventAndDeleteLoginLink(
  props: CreateLoginEventAndDeleteLoginLinkInput
): Promise<void> {
  const { userId, loginLinkId, orgId } = props;

  const now = Time.currentISO();

  const newUserLoginEvent: DynamoNewLoginEvent = {
    PK: `${ENTITY_TYPES.USER}#${userId}`, // TODO set login events as org events if the user has an org
    SK: `${ENTITY_TYPES.LOGIN_EVENT}#${now}`,
    // TODO in the future, get more the info about the login event such as IP, headers, device, etc.
    createdAt: now,
    ttlExpiry: Time.futureUNIX(30, TIME_UNITS.DAYS), // TODO ENUM for login retention period
  };

  const newOrgLoginEvent = {
    // TODO types
    PK: `${ENTITY_TYPES.ORG}#${orgId}`, // TODO set login events as org events if the user has an org
    SK: `${ENTITY_TYPES.LOGIN_EVENT}#${now}`,
    // TODO in the future, get more the info about the login event such as IP, headers, device, etc.
    createdAt: now,
    ttlExpiry: Time.futureUNIX(30, TIME_UNITS.DAYS), // TODO ENUM for login retention period
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
    return;
  } catch (error) {
    // TODO error enum
    throw new Error(error);
  }
}
