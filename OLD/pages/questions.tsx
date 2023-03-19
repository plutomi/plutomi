import { NewPageLayout } from '../components/NewPageLayout';
import { QuestionsContent } from '../components/QuestionsContent';

export default function Questions() {
  return (
    <NewPageLayout
      loggedOutPageText="Log in to view your questions"
      currentNavbarItem="Questions"
      headerText="Questions"
    >
      <QuestionsContent />
    </NewPageLayout>
  );
}
