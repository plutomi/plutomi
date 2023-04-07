import { NewPageLayout } from '../../components/NewPageLayout';
import { OpeningsPageContent } from '../../components/OpeningsPageContent';

export default function Openings() {
  return (
    <NewPageLayout
      loggedOutPageText="Log in to view your openings"
      currentNavbarItem="Openings"
      headerText="Openings"
    >
      <OpeningsPageContent />
    </NewPageLayout>
  );
}
