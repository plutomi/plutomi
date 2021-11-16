import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../defaults";
import Time from "../time";

const { DYNAMO_TABLE_NAME } = process.env;

export async function joinOrgFromInvite({ userId, invite }) {
  const now = Time.currentISO();
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
          // Update user with the new org and decrement their total invites
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${userId}`,
              SK: `USER`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET orgId = :orgId, orgJoinDate = :orgJoinDate, GSI1PK = :GSI1PK, totalInvites = totalInvites - :value",
            ExpressionAttributeValues: {
              ":orgId": invite.orgId,
              ":orgJoinDate": now,
              ":GSI1PK": `${ENTITY_TYPES.ORG}#${invite.orgId}#USERS`,
              ":value": 1,
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
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}
