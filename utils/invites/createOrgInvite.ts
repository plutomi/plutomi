import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../lib/awsClients/ddbDocClient";
import { GetAllUserInvites } from "./getAllOrgInvites";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";

const { DYNAMO_TABLE_NAME } = process.env;

export default async function CreateOrgInvite({
  orgId,
  expires_at,
  created_by,
  user,
  org_name,
}) {
  try {
    if (user.orgId === orgId) {
      throw "User is already in your org";
    }

    // Check if the user we are inviting already has pending invites for the current org
    const pending_invites = await GetAllUserInvites(user.userId);
    const unclaimed_invites = pending_invites.filter(
      (invite) => invite.orgId == orgId
    );

    if (unclaimed_invites.length > 0) {
      throw `This user already has a pending invite to your org! They can log in at ${process.env.WEBSITE_URL}/invites to claim it!`;
    }
    const invite_id = nanoid(50);
    const now = GetCurrentTime("iso") as string;
    const new_org_invite = {
      PK: `USER#${user.userId}`,
      SK: `ORG_INVITE#${invite_id}`, // Allows sorting, and incase two get created in the same millisecond
      orgId: orgId,
      org_name: org_name, // using org_name here because GSI1SK is taken obv
      created_by: created_by,
      entity_type: "ORG_INVITE",
      created_at: now,
      expires_at: expires_at,
      invite_id: invite_id,
      GSI1PK: `ORG#${orgId}#ORG_INVITES`,
      GSI1SK: now,
    };

    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Add a new invite
          Put: {
            Item: new_org_invite,
            TableName: DYNAMO_TABLE_NAME,
            ConditionExpression: "attribute_not_exists(PK)",
          },
        },

        {
          // Increment the user's total invites
          Update: {
            Key: {
              PK: `USER#${user.userId}`,
              SK: `USER`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET total_invites = if_not_exists(total_invites, :zero) + :value",
            ExpressionAttributeValues: {
              ":zero": 0,
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
