import SignedInNav from "../components/Navbar/SignedInNav";
import OpeningsHeader from "../components/Openings/OpeningsHeader";
import { useSession } from "next-auth/client";
import useOpenings from "../SWR/useOpenings";
import useUser from "../SWR/useUser";
import EmptyTeamState from "../components/Team/EmptyTeamState";
import axios from "axios";
import TeamContent from "../components/Team/TeamContent";
import Loader from "../components/Loader";
import SignIn from "../components/SignIn";
import CreateInviteModal from "../components/CreateInviteModal";
import useOrgUsers from "../SWR/useOrgUsers";
import useStore from "../utils/store";
import TeamHeader from "../components/Team/TeamHeader";
export default function Team() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  const { orgUsers, isOrgUsersLoading, isOrgUsersError } = useOrgUsers(
    user?.org_id,
    user?.user_id
  );

  const setCreateInviteModalOpen = useStore(
    (state: PlutomiState) => state.setCreateInviteModalOpen
  );

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) {
    return <Loader text="Loading..." />;
  }

  // If no session or bad userid
  if (!session || isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings`} // TODO set this
        desiredPage={"your openings"} // TODO set this
      />
    );
  }

  if (isUserLoading) {
    return <Loader text="Loading user..." />;
  }

  // TODO loader bug again, styles not being applied when going from dashboard to here
  // I think its because it's trying to get the  path but it's not there for a fraction of a second
  if (isOrgUsersLoading) {
    return <Loader text="Loading team..." />;
  }

  const createInvite = async (recipient: string) => {
    try {
      // TODO add custom expiry - Defaults to 3 days
      const body: APICreateOrgInviteInput = {
        recipient: recipient,
      };
      const { status, data } = await axios.post(
        `/api/orgs/${user.org_id}/invite`,
        body
      );
      alert(data.message);
      setCreateInviteModalOpen(false);
    } catch (error) {
      console.error(error);
      alert(error.response.data.message);
    }
  };

  return (
    <>
      <CreateInviteModal createInvite={createInvite} />
      <SignedInNav current="Openings" />
      <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
        <header>
          <TeamHeader />
        </header>

        <main className="mt-5">
          {orgUsers.length <= 1 ? <EmptyTeamState /> : <TeamContent />}
        </main>
      </div>
    </>
  );
}
