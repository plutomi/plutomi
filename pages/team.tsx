import SignedInNav from "../components/Navbar/SignedInNav";
import { useSession } from "next-auth/client";
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
import { useRouter } from "next/router";
export default function Team() {
  const router = useRouter();
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
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/team`} // TODO set this
        desiredPage={"your team"} // TODO set this
      />
    );
  }

  if (isUserLoading) {
    return <Loader text="Loading user..." />;
  }

  if (isOrgUsersError) {
    alert(
      // TODO this is not returning the error message from the API call due to the way SWR handles errors. Fix !
      `You must create an org or join one before adding or viewing team members. If you have pending invites, you can view them at ${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/invites`
    );
    router.push(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard`);
    return null;
  }

  const createInvite = async (recipient_email: string) => {
    try {
      // TODO add custom expiry - Defaults to 3 days
      const body: APICreateOrgInviteInput = {
        recipient_email: recipient_email,
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
      <SignedInNav current="Team" />
      <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
        <header>
          <TeamHeader />
        </header>

        <main className="mt-5">
          {orgUsers?.length <= 1 ? <EmptyTeamState /> : <TeamContent />}
        </main>
      </div>
    </>
  );
}
