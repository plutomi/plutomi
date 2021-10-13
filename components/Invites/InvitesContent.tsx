import { useSession } from "next-auth/client";
import useUser from "../../SWR/useUser";
import Loader from "../Loader";
import Invite from "./Invite";
import { mutate } from "swr";
import axios from "axios";
import { useRouter } from "next/router";
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
      const body: APIAcceptOrgInvite = {
        timestamp: invite.created_at,
        invite_id: invite.invite_id,
      };

      const { status, data } = await axios.post(
        `/api/orgs/${invite.org_id}/join`,
        body
      );
      alert(data.message);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.response.data.message);
    }
    mutate(`/api/users/${user.user_id}/invites`);
  };

  const rejectInvite = async (invite) => {
    try {
      const body: APIRejectOrgInvite = {
        timestamp: invite.created_at,
        invite_id: invite.invite_id,
      };

      const { status, data } = await axios.post(
        `/api/orgs/${invite.org_id}/reject`,
        body
      );
      alert(data.message);
    } catch (error) {
      console.error(error);
      alert(error.response.data.message);
    }
    mutate(`/api/users/${user.user_id}/invites`);
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
