import { useSession } from "next-auth/client";
import SignIn from "../components/SignIn";
import useUser from "../SWR/useUser";
import useOrgInvites from "../SWR/useOrgInvites";
import { GetRelativeTime } from "../utils/time";
import axios from "axios";
import { useSWRConfig } from "swr";
import GoBack from "../components/Buttons/GoBackButton";
import UserProfileCard from "../components/UserProfileCard";
import SignedInNav from "../components/Navbar/SignedInNav";
import { useRouter } from "next/router";

export default function Invites() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [session, loading]: CustomSession = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  const { invites, isInvitesLoading, isInvitesError } = useOrgInvites(
    session?.user_id
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

  /** ~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   * ~~LOADING STATES START~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   */

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) {
    return null;
  }

  // If no session or bad userid
  if (!session || isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/invites`}
        desiredPage={"your invites"}
      />
    );
  }

  if (isUserLoading) {
    return (
      <div className="mx-auto p-20 flex justify-center items-center">
        <h1 className="text-4xl text-dark font-medium">Loading...</h1>
      </div>
    );
  }

  /** ~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~LOADING STATES END~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   */

  return (
    <>
      <SignedInNav current={"PLACEHOLDER"} />

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Content */}
          </div>
        </header>
        <UserProfileCard user={user} /> {/* Debugging */}
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Content */}
            <ul
              role="list"
              className="divide-y divide-gray-200 mx-auto max-w-xl flex-col space-y-4 p-20 border rounded-md shadow-md"
            >
              {invites?.length > 0 ? (
                invites.map((invite: DynamoOrgInvite) => (
                  <li
                    key={invite.expires_at}
                    className="py-4 flex border rounded-md w-full"
                  >
                    <div className="ml-3">
                      <p className="text-sm font-medium text-dark">
                        {invite.invited_by.first_name}{" "}
                        {invite.invited_by.last_name}
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
                    <button
                      onClick={() => rejectInvite(invite)}
                      className="px-4 py-3 border border-transparent bg-red-500 text-white rounded-md m-4"
                    >
                      Reject
                    </button>
                  </li>
                ))
              ) : (
                <h1 className="mt-4 text-lg font-bold">
                  You don&apos;t have any invites
                </h1>
              )}
            </ul>
          </div>
        </main>
      </div>
    </>
  );
}
