import { GetUserByEmail } from "./getUserByEmail";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetOrgInvite } from "./getOrgInvite";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetCurrentTime } from "../time";
import DeleteOrgInvite from "./DeleteOrgInvite";
const { DYNAMO_TABLE_NAME } = process.env;
export default async function AcceptOrgInvite({
  user_id,
  invite_id,
  timestamp,
}: GetOrgInviteInput) {
  try {
    let invite = await GetOrgInvite({ user_id, invite_id, timestamp });

    if (!invite) {
      throw new Error("Invite no longer exists");
    }

    if (invite.is_claimed) {
      await DeleteOrgInvite({ user_id, invite_id, timestamp });
      throw new Error("Invite has already been claimed");
    }

    if (invite.expires_at <= GetCurrentTime("iso")) {
      await DeleteOrgInvite({ user_id, invite_id, timestamp });
      throw new Error("Invite has expired");
    }

    const now = GetCurrentTime("iso");
    const updated_invite = {
      ...invite,
      is_claimed: true,
      claimed_at: now,
    };

    const params: PutCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Item: updated_invite,
    };

    await Dynamo.send(new PutCommand(params));
    return;
  } catch (error) {
    throw new Error(`Unable to accept invite ${error}`);
  }
}
