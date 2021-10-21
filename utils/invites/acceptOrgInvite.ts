import { GetAllUserInvites } from "./getAllOrgInvites";
import DeleteOrgInvite from "./deleteOrgInvite";
import { GetOrgInvite } from "./getOrgInvite";
import { GetCurrentTime } from "../time";

// This is really a misnomer. There is no 'accept' per say.
// We just check that the invite is valid and then delete it
export default async function AcceptOrgInvite({ user_id, invite_id }) {
  try {
    let invite = await GetOrgInvite({ user_id, invite_id });

    if (!invite) {
      throw new Error("Invite no longer exists");
    }

    if (invite.expires_at <= GetCurrentTime("iso")) {
      DeleteOrgInvite({ user_id, invite_id });
      throw new Error("Invite has expired");
    }
    DeleteOrgInvite({ user_id, invite_id });

    return;
  } catch (error) {
    throw new Error(`${error}`);
  }
}
