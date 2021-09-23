import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetUserByEmail } from "../users/getUserByEmail";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetAllOrgInvites } from "./getAllOrgInvites";
import { CreateUser } from "../users/createUser";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";

const { DYNAMO_TABLE_NAME } = process.env;

export default async function CreateOrgInvite({
  org_id,
  expires_at,
  invited_by,
  recipient,
}: CreateOrgInviteInput) {
  try {
    let user = await GetUserByEmail(recipient);

    if (!user) {
      try {
        const new_user: CreateUserInput = {
          first_name: "NO_FIRST_NAME",
          last_name: "NO_LAST_NAME",
          user_email: recipient,
        };

        user = await CreateUser(new_user);
      } catch (error) {
        console.error(error);
        throw new Error("Unable to create user being invited");
      }
    }

    if (user.org_id === org_id) {
      throw new Error("User is already in your org");
    }

    // Check if the user we are inviting already has pending invites for the current org
    const pending_invites = await GetAllOrgInvites(user.user_id);
    const unclaimed_invites = pending_invites.filter(
      (invite) => invite.org_id == org_id
    );

    if (unclaimed_invites.length > 0) {
      throw new Error(
        "This user already has a pending invite to your org! They can sign in at plutomi.com/invites to claim it!"
      );
    }
    const invite_id = nanoid(3);
    const now = GetCurrentTime("iso");
    const new_org_invite = {
      PK: `USER#${user.user_id}`,
      SK: `ORG_INVITE#${now}#INVITE_ID#${invite_id}`, // Allows sorting, and incase two get created in the same millisecond
      org_id: org_id,
      invited_by: invited_by,
      entity_type: "ORG_INVITE",
      created_at: now,
      expires_at: expires_at,
      invite_id: invite_id,
      GSI1PK: `ORG#${org_id}#ORG_INVITES`,
      GSI1SK: now,
    };

    const params: PutCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Item: new_org_invite,
      ConditionExpression: "attribute_not_exists(PK)",
    };

    await Dynamo.send(new PutCommand(params));
    return;
  } catch (error) {
    throw new Error(error);
  }
}
