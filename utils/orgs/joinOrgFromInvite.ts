import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { getCurrentTime } from "../time";

const { DYNAMO_TABLE_NAME } = process.env;

export async function JoinOrgFromInvite({ userId, invite }) {
  const now = getCurrentTime("iso") as string;
  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete org invite
          Delete: {
            Key: {
              PK: `USER#${userId}`,
              SK: `ORG_INVITE#${invite.invite_id}`,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },

        {
          // Update user with the new org and decrement their total invites
          Update: {
            Key: {
              PK: `USER#${userId}`,
              SK: `USER`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET orgId = :orgId, orgJoinDate = :orgJoinDate, GSI1PK = :GSI1PK, totalInvites = totalInvites - :value",
            ExpressionAttributeValues: {
              ":orgId": invite.orgId,
              ":orgJoinDate": now,
              ":GSI1PK": `ORG#${invite.orgId}#USERS`,
              ":value": 1,
            },
          },
        },
        {
          // Increment the org with the new user
          Update: {
            Key: {
              PK: `ORG#${invite.orgId}`,
              SK: `ORG`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression: "SET total_users = total_users + :value",
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
