import SignedInNav from "../components/Navbar/SignedInNav";
import { useSession } from "next-auth/client";
import useSelf from "../SWR/useSelf";
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
import InvitesService from "../adapters/InvitesService";
export default function Team() {
  const router = useRouter();

  const { user, isUserLoading, isUserError } = useSelf();
  const { orgUsers, isOrgUsersLoading, isOrgUsersError } = useOrgUsers(
    user?.org_id,
    user?.user_id
  );

  const setCreateInviteModalOpen = useStore(
    (state: PlutomiState) => state.setCreateInviteModalOpen
  );

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && isUserLoading) {
    return <Loader text="Loading..." />;
  }

  if (isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.PLUTOMI_URL}/team`} // TODO set this
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
      `You must create an org or join one before adding or viewing team members. If you have pending invites, you can view them at ${process.env.PLUTOMI_URL}/invites`
    );
    router.push(`${process.env.PLUTOMI_URL}/dashboard`);
    return null;
  }

  const createInvite = async (recipient_email: string) => {
    try {
      // TODO add custom expiry - Defaults to 3 days
      const { message } = await InvitesService.createInvite({
        recipient_email: recipient_email,
      });
      alert(message);
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
