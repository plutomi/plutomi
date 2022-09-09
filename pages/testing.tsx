import { InvitesPageContent } from '../components/InvitesPageContent/InvitesPageContent';
import { NewPageLayout } from '../components/NewPageLayout';

export default function Invites() {
  return (
    <div>
      <h1>Testing some deployment settings :D TODO remove</h1>
      <h1>STATUS CHECK (should be empty as its an env): {process.env.STATUS_CHECK}</h1>
    </div>
  );
}
