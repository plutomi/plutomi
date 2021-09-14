import { Dynamo } from "../../libs/ddbDocClient";
import { GetOrgInvite } from "./getOrgInvite";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetCurrentTime } from "../time";
import DeleteOrgInvite from "./deleteOrgInvite";
const { DYNAMO_TABLE_NAME } = process.env;

// This is really a misnomer. There is no 'accept' per say.
// We just check that the invite is valid and then delete it
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

    if (invite.expires_at <= GetCurrentTime("iso")) {
      await DeleteOrgInvite({ user_id, invite_id, timestamp });
      throw new Error("Invite has expired");
    }

    await DeleteOrgInvite({ user_id, invite_id, timestamp });
    return;
  } catch (error) {
    throw new Error(`Unable to accept invite ${error}`);
  }
}
