import deleteOrgInvite from "./deleteOrgInvite";
import { getOrgInvite } from "./getOrgInvite";
import Time from "../time";

// This is really a misnomer. There is no 'accept' per say.
// We just check that the invite is valid and then delete it
export default async function acceptOrgInvite({ userId, inviteId }) {
  try {
    let invite = await getOrgInvite(userId, inviteId);

    if (!invite) {
      throw "Invite no longer exists"; // todo add to errors enum
    }

    if (invite.expiresAt <= Time.currentISO()) {
      deleteOrgInvite({ userId, inviteId });
      throw "Invite has expired"; // todo add to errors enum
    }
    deleteOrgInvite({ userId, inviteId });

    return;
  } catch (error) {
    throw new Error(error);
  }
}
