import { GetAllUserInvites } from "./getAllOrgInvites";
import DeleteOrgInvite from "./deleteOrgInvite";
import { GetOrgInvite } from "./getOrgInvite";
import { GetCurrentTime } from "../time";

// This is really a misnomer. There is no 'accept' per say.
// We just check that the invite is valid and then delete it
export default async function AcceptOrgInvite({ userId, invite_id }) {
  try {
    let invite = await GetOrgInvite({ userId, invite_id });

    if (!invite) {
      throw "Invite no longer exists";
    }

    if (invite.expires_at <= GetCurrentTime("iso")) {
      DeleteOrgInvite({ userId, invite_id });
      throw "Invite has expired";
    }
    DeleteOrgInvite({ userId, invite_id });

    return;
  } catch (error) {
    throw new Error(error);
  }
}
