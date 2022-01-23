import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { SdkError } from "@aws-sdk/types";
import { Dynamo } from "../../AWSClients/ddbDocClient";
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
  const { loginLinkId, user } = props;

  const now = Time.currentISO();

  const newUserLoginEvent: DynamoNewLoginEvent = {
    PK: `${ENTITY_TYPES.USER}#${user.userId}`,
    SK: `${ENTITY_TYPES.LOGIN_EVENT}#${now}`,
    user: user,
    entityType: ENTITY_TYPES.LOGIN_EVENT,
    // TODO in the future, get more the info about the login event such as IP, headers, device, etc.
    createdAt: now,
    ttlExpiry: Time.futureUNIX(
      DEFAULTS.LOGIN_EVENT_RETENTION_PERIOD,
      TIME_UNITS.DAYS
    ),
  };


  console.log("New user login event", newUserLoginEvent)
  const newOrgLoginEvent = {
    // TODO types
    PK: `${ENTITY_TYPES.ORG}#${user.orgId}`,
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
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            ConditionExpression: "attribute_not_exists(PK)",
          },
        },

        {
          // Delete the link used to login
          Delete: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${user.userId}`,
              SK: `${ENTITY_TYPES.LOGIN_LINK}#${loginLinkId}`,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            ConditionExpression: "attribute_exists(PK)", // Link MUST exist!!!
          },
        },
      ],
    };
    // If a user has an orgId, create a login event on the org as well
    user.orgId != DEFAULTS.NO_ORG ??
      transactParams.TransactItems.push({
        // Create a login event on the org
        Put: {
          Item: newOrgLoginEvent,
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

          ConditionExpression: "attribute_not_exists(PK)",
        },
      });
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
