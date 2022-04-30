import { Dynamo } from "../../AWSClients/ddbDocClient";
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from "../../Config";
import { SdkError } from "@aws-sdk/types";
import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DeleteOrgInviteInput } from "../../types/main";

/**
 * 1. Rejecting invite as invitee
 * 2. Deleting invite
 */
export default async function DeleteInvite(
  props: DeleteOrgInviteInput
): Promise<[null, null] | [null, SdkError]> {
  const { userId, inviteId } = props;
  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete the invite
          Delete: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${userId}`,
              SK: `${ENTITY_TYPES.ORG_INVITE}#${inviteId}`,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            ConditionExpression: "attribute_exists(PK)",
          },
        },

        {
          // Decrement the recipient's total invites
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${userId}`,
              SK: ENTITY_TYPES.USER,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression: "SET totalInvites = totalInvites - :value",
            ExpressionAttributeValues: {
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
