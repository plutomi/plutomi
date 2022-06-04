import { InvitesPageContent } from '../components/InvitesPageContent/InvitesPageContent';
import { NewPageLayout } from '../components/NewPageLayout';

export default function Invites() {
  return (
    <NewPageLayout
      loggedOutPageText="Log in to view your invites"
      currentNavbarItem="Invites"
      headerText="Invites"
    >
      <InvitesPageContent />
    </NewPageLayout>
  );
}
