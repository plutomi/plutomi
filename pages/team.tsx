import SignedInNav from "../components/Navbar/SignedInNav";
import useSelf from "../SWR/useSelf";
import EmptyTeamState from "../components/Team/EmptyTeamState";
import TeamContent from "../components/Team/TeamContent";
import Loader from "../components/Loader";
import Login from "../components/Login";
import CreateInviteModal from "../components/CreateInviteModal";
import useOrgUsers from "../SWR/useOrgUsers";
import useStore from "../utils/store";
import { useRouter } from "next/router";
import InvitesService from "../adapters/InvitesService";

import NewPage from "../components/Templates/NewPage";
import InvitesContent from "../components/Invites/InvitesContent";
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

  if (isOrgUsersError) {
    alert(
      // TODO this is not returning the error message from the API call due to the way SWR handles errors. Fix !
      `You must create an org or join one before adding or viewing team members. If you have pending invites, you can view them at ${process.env.WEBSITE_URL}/invites`
    );
    router.push(`${process.env.WEBSITE_URL}/dashboard`);
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
    <NewPage
      loggedOutPageText={"Log in to view your team"}
      currentNavbarItem={"Team"}
      headerText={"Team"}
    >
      <CreateInviteModal createInvite={createInvite} />

      {orgUsers?.length <= 1 ? <EmptyTeamState /> : <TeamContent />}
    </NewPage>
  );
}
