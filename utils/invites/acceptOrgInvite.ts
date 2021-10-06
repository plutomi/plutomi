import { GetAllOrgInvites } from "./getAllOrgInvites";
import DeleteOrgInvite from "./deleteOrgInvite";
import { GetOrgInvite } from "./getOrgInvite";
import { GetCurrentTime } from "../time";

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
      DeleteOrgInvite({ user_id, invite_id, timestamp });
      throw new Error("Invite has expired");
    }

    // Delete all invites for that org
    const all_invites = await GetAllOrgInvites(user_id);

    const filtered_invites = all_invites.filter(
      (invitation) => invite.org_id == invitation.org_id
    );

    filtered_invites.forEach((remaining_invite) => {
      const { invite_id, created_at } = remaining_invite;
      const delete_invite_input = {
        user_id: user_id,
        invite_id: invite_id,
        timestamp: created_at,
      };

      DeleteOrgInvite(delete_invite_input);
    });

    return;
  } catch (error) {
    throw new Error(`${error}`);
  }
}
