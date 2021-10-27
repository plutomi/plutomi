import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetUserByEmail } from "../users/getUserByEmail";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetAllUserInvites } from "./getAllOrgInvites";
import { CreateUser } from "../users/createUser";
import { GetCurrentTime } from "../time";
import { nanoid } from "nanoid";

const { DYNAMO_TABLE_NAME } = process.env;

export default async function CreateOrgInvite({
  org_id,
  expires_at,
  created_by,
  recipient_email,
  org_name,
}: CreateOrgInviteInput) {
  try {
    let user = await GetUserByEmail(recipient_email);

    if (!user) {
      try {
        const new_user: CreateUserInput = {
          first_name: "NO_FIRST_NAME",
          last_name: "NO_LAST_NAME",
          user_email: recipient_email,
        };

        user = await CreateUser(new_user);
      } catch (error) {
        console.error(error);
        throw "Unable to create user being invited";
      }
    }

    if (user.org_id === org_id) {
      throw "User is already in your org";
    }

    // Check if the user we are inviting already has pending invites for the current org
    const pending_invites = await GetAllUserInvites(user.user_id);
    const unclaimed_invites = pending_invites.filter(
      (invite) => invite.org_id == org_id
    );

    if (unclaimed_invites.length > 0) {
      throw `This user already has a pending invite to your org! They can log in at ${process.env.WEBSITE_URL}/invites to claim it!`;
    }
    const invite_id = nanoid(50);
    const now = GetCurrentTime("iso") as string;
    const new_org_invite = {
      PK: `USER#${user.user_id}`,
      SK: `ORG_INVITE#${invite_id}`, // Allows sorting, and incase two get created in the same millisecond
      org_id: org_id,
      org_name: org_name, // using org_name here because GSI1SK is taken obv
      created_by: created_by,
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
