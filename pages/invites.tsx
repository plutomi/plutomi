import { useSession } from "next-auth/client";
import SignIn from "../components/SignIn";
import AlreadySignedIn from "../components/AlreadySignedIn";
import Dash from "../components/Dash";
import useUser from "../SWR/useUser";
import useOrgInvites from "../SWR/useOrgInvites";
import { GetRelativeTime } from "../utils/time";
import axios from "axios";
export default function Invites() {
  const [session]: CustomSession = useSession();

  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  const { invites, isInvitesLoading, isInvitesError } = useOrgInvites(
    session?.user_id
  );

  if (!session) {
    return <SignIn />;
  }

  const acceptInvite = async (invite) => {
    try {
      const body: GetOrgInviteInput = {
        user_id: user.user_id,
        timestamp: invite.created_at,
        invite_id: invite.invite_id,
      };

      const { status, data } = await axios.post(
        `/api/orgs/${invite.org_id}/join`,
        body
      );
      alert(data.message);
    } catch (error) {
      console.error(error);
      alert(error.response.data.message);
    }
  };

  return (
    <ul
      role="list"
      className="divide-y divide-gray-200 mx-auto max-w-xl flex-col space-y-4 p-20 border rounded-md shadow-md"
    >
      {invites?.length > 0 && user ? (
        invites.map((invite: CreateOrgInviteInput) => (
          <li
            key={invite.expires_at}
            className="py-4 flex border rounded-md w-full"
          >
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-gray-900">
                {invite.invited_by.first_name} {invite.invited_by.last_name}
              </p>
              <p className="text-sm font-medium text-blue-gray-500">
                {invite.invited_by.user_email}
              </p>
              <p className="text-sm text-blue-gray-500">
                Expires {GetRelativeTime(invite.expires_at)}
              </p>
              <p className="text-sm text-blue-gray-500">
                Org ID: {invite.org_id}
              </p>
            </div>
            <button
              onClick={() => acceptInvite(invite)}
              className="px-4 py-3 border border-transparent bg-blue-gray-900 text-white rounded-md m-4"
            >
              Accept
            </button>
          </li>
        ))
      ) : (
        <h1 className="mt-4 text-lg font-bold">
          You don&apos;t have any invites
        </h1>
      )}
    </ul>
  );
}
