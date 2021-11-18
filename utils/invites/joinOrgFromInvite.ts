import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../defaults";
import { JoinOrgFromInviteInput } from "../../types/main";
import Time from "../time";

const { DYNAMO_TABLE_NAME } = process.env;

/**
 * Adds the user to the org and deletes the org invite
 * @param param
 */
export async function joinOrgFromInvite(
  props: JoinOrgFromInviteInput
): Promise<void> {
  const { userId, invite } = props;
  // TODO types
  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete org invite
          Delete: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${userId}`,
              SK: `${ENTITY_TYPES.ORG_INVITE}#${invite.inviteId}`,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },

        {
          // Update the user with the new org
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${userId}`,
              SK: ENTITY_TYPES.USER,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET orgId = :orgId, orgJoinDate = :orgJoinDate, GSI1PK = :GSI1PK",
            ExpressionAttributeValues: {
              ":orgId": invite.orgId,
              ":orgJoinDate": Time.currentISO(),
              ":GSI1PK": `${ENTITY_TYPES.ORG}#${invite.orgId}#${ENTITY_TYPES.USER}S`,
            },
          },
        },
        {
          // Increment the org with the new user
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${invite.orgId}`,
              SK: `${ENTITY_TYPES.ORG}`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression: "SET totalUsers = totalUsers + :value",
            ExpressionAttributeValues: {
              ":value": 1,
            },
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));
    return;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}
