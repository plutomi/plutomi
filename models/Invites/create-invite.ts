import { PutCommandInput, PutCommand } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ID_LENGTHS, ENTITY_TYPES, TIME_UNITS, DEFAULTS } from "../../Config";
import { DynamoOrgInvite } from "../../types/dynamo";
import { CreateOrgInviteInput } from "../../types/main";
import * as Time from "../../utils/time";
import { SdkError } from "@aws-sdk/types";

import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 * Invites a user to join your org
 * @param props {@link CreateOrgInviteInput}
 * @returns
 */
export default async function Create(
  props: CreateOrgInviteInput
): Promise<[null, null] | [null, SdkError]> {
  const { expiresAt, createdBy, recipient, orgName } = props;
  try {
    const inviteId = nanoid(ID_LENGTHS.ORG_INVITE);
    const now = Time.currentISO();
    const newOrgInvite: DynamoOrgInvite = {
      PK: `${ENTITY_TYPES.USER}#${recipient.userId}`,
      SK: `${ENTITY_TYPES.ORG_INVITE}#${inviteId}`,
      orgId: createdBy.orgId,
      orgName,
      createdBy,
      recipient,
      entityType: ENTITY_TYPES.ORG_INVITE,
      createdAt: now,
      expiresAt,
      inviteId,
      // TODO TTL
      GSI1PK: `${ENTITY_TYPES.ORG}#${createdBy.orgId}#${ENTITY_TYPES.ORG_INVITE}S`, // Returns all invites sent by an org
      GSI1SK: now,
    };
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Create the org invite
          Put: {
            Item: newOrgInvite,
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            ConditionExpression: "attribute_not_exists(PK)",
          },
        },

        {
          // Increment the recipient's total invites
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${recipient.userId}`,
              SK: ENTITY_TYPES.USER,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

            UpdateExpression:
              "SET totalInvites = if_not_exists(totalInvites, :zero) + :value",
            ExpressionAttributeValues: {
              ":zero": 0,
              ":value": 1,
            },
            ConditionExpression: "attribute_exists(PK)",
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));

    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
