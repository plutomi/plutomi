import { DashboardPageContent } from '../components/DashboardPageContent';
import { NewPageLayout } from '../components/NewPageLayout';

export default function Dashboard() {
  return (
    <NewPageLayout
      loggedOutPageText="Log in to view your dashboard"
      currentNavbarItem="Dashboard"
      headerText="Dashboard"
    >
      <DashboardPageContent />
    </NewPageLayout>
  );
}
