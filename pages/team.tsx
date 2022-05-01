import TeamContent from '../components/Team/TeamContent';

import NewPage from '../components/Templates/NewPage';

export default function Team() {
  return (
    <NewPage
      loggedOutPageText="Log in to view your team"
      currentNavbarItem="Team"
      headerText="Team"
    >
      <TeamContent />
    </NewPage>
  );
}
