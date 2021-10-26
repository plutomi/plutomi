import NewPage from "../components/Templates/NewPage";
import InvitesContent from "../components/Invites/InvitesContent";
export default function Invites() {
  return (
    <NewPage
      loggedOutPageText={"Log in to view your invites"}
      currentNavbarItem={"Invites"}
      headerText={"Invites"}
    >
      <InvitesContent />
    </NewPage>
  );
}
