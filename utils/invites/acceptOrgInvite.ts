import { getAllUserInvites } from "./getAllOrgInvites";
import deleteOrgInvite from "./deleteOrgInvite";
import { getOrgInvite } from "./getOrgInvite";
import { GetCurrentTime } from "../time";

// This is really a misnomer. There is no 'accept' per say.
// We just check that the invite is valid and then delete it
export default async function acceptOrgInvite({ userId, inviteId }) {
  try {
    let invite = await getOrgInvite(userId, inviteId);

    if (!invite) {
      throw "Invite no longer exists";
    }

    if (invite.expiresAt <= GetCurrentTime("iso")) {
      deleteOrgInvite({ userId, inviteId });
      throw "Invite has expired";
    }
    deleteOrgInvite({ userId, inviteId });

    return;
  } catch (error) {
    throw new Error(error);
  }
}
