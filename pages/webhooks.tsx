import { NewPageLayout } from '../components/NewPageLayout';
import { WebhooksList } from '../components/WebhooksList';

export default function Team() {
  return (
    <NewPageLayout
      loggedOutPageText="Log in to view your webhooks"
      currentNavbarItem="Webhooks"
      headerText="Webhooks"
    >
      <WebhooksList />
    </NewPageLayout>
  );
}
