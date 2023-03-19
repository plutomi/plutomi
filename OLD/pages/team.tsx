import { NewPageLayout } from '../components/NewPageLayout';
import { TeamPageContent } from '../components/TeamPageContent';

export default function Team() {
  return (
    <NewPageLayout
      loggedOutPageText="Log in to view your team"
      currentNavbarItem="Team"
      headerText="Team"
    >
      <TeamPageContent />
    </NewPageLayout>
  );
}
