import { useRouter } from 'next/router';
import OpeningSettingsHeader from '../../../components/Openings/OpeningSettingsHeader';
import OpeningSettingsContent from '../../../components/Openings/OpeningSettingsContent';
import NewPage from '../../../components/Templates/NewPage';
import useOpeningInfo from '../../../SWR/useOpeningInfo';
import { CustomQuery } from '../../../types/main';

export default function OpeningSettings() {
  const router = useRouter();
  const { openingId } = router.query as Pick<CustomQuery, 'openingId'>;
  const { opening, isOpeningLoading, isOpeningError } = useOpeningInfo(openingId);
  return (
    <NewPage
      loggedOutPageText="Log in to view your opening settings"
      currentNavbarItem="Openings"
      headerText={
        isOpeningLoading ? 'Loading opening settings...' : `${opening?.openingName} - Settings`
      }
    >
      <>
        <OpeningSettingsHeader />
        <OpeningSettingsContent />
      </>
    </NewPage>
  );
}
