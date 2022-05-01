import NewPage from '../../components/Templates/NewPage';
import OpeningsContent from '../../components/Openings/OpeningsContent';

export default function Openings() {
  return (
    <NewPage
      loggedOutPageText="Log in to view your openings"
      currentNavbarItem="Openings"
      headerText="Openings"
    >
      <OpeningsContent />
    </NewPage>
  );
}
