import WebhooksContent from '../components/Webhooks/WebhooksContent';
import NewPage from '../components/Templates/NewPage';
export default function Team() {
  return (
    <NewPage
      loggedOutPageText="Log in to view your webhooks"
      currentNavbarItem="Webhooks"
      headerText="Webhooks"
    >
      <WebhooksContent />
    </NewPage>
  );
}
