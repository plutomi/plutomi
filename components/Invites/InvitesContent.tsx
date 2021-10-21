import { useSession } from "next-auth/client";
import useUser from "../../SWR/useUser";
import Loader from "../Loader";
import Invite from "./Invite";
import { mutate } from "swr";
import axios from "axios";
import UsersService from "../../adapters/UsersService";
import { useRouter } from "next/router";
import InvitesService from "../../adapters/InvitesService";
import useOrgInvites from "../../SWR/useOrgInvites";
export default function InvitesContent() {
  const router = useRouter();
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  const { invites, isInvitesLoading, isInvitesError } = useOrgInvites(
    user?.user_id
  );

  const acceptInvite = async (invite) => {
    try {
      const { message } = await InvitesService.acceptInvite({
        invite_id: invite.invite_id,
        timestamp: invite.created_at,
        org_id: invite.org_id,
      });
      alert(message);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.response.data.message);
    }

    // Refresh the user's org
    mutate(UsersService.getUserURL({ user_id: user?.user_id }));
    mutate(InvitesService.getInvitesURL({ user_id: user?.user_id }));
  };

  const rejectInvite = async (invite) => {
    try {
      const { message } = await InvitesService.rejectInvite({
        invite_id: invite.invite_id,
        timestamp: invite.created_at,
      });

      alert(message);
    } catch (error) {
      console.error(error);
      alert(error.response.data.message);
    }

    mutate(InvitesService.getInvitesURL({ user_id: user?.user_id }));
  };

  if (isInvitesLoading) {
    return <Loader text="Loading invites..." />;
  }

  if (invites.length == 0) {
    return <h1>You don&apos;t have any invites :(</h1>;
  }
  return (
    <div className="">
      <ul
        role="list"
        className="divide-y divide-gray-200 mx-auto max-w-xl flex-col space-y-4 p-20  "
      >
        {invites.map((invite: DynamoOrgInvite) => (
          <Invite
            invite={invite}
            key={invite.expires_at}
            rejectInvite={rejectInvite}
            acceptInvite={acceptInvite}
          />
        ))}
      </ul>
    </div>
  );
}
