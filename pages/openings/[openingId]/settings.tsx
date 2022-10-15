import { useRouter } from 'next/router';
import { NewPageLayout } from '../../../components/NewPageLayout';
import { OpeningSettingsContent } from '../../../components/OpeningSettingsContent';
import { OpeningSettingsHeader } from '../../../components/OpeningSettingsHeader';
import { useOpeningInfo } from '../../../SWR/useOpeningInfo';
import { CustomQuery } from '../../../types/main';

export default function OpeningSettings() {
  const router = useRouter();
  const { openingId } = router.query as Pick<CustomQuery, 'openingId'>;
  const { opening, isOpeningLoading, isOpeningError } = useOpeningInfo({ openingId });
  return (
    <NewPageLayout
      loggedOutPageText="Log in to view your opening settings"
      currentNavbarItem="Openings"
      headerText={isOpeningLoading ? 'Loading opening settings...' : `${opening?.name} - Settings`}
    >
      <>
        <OpeningSettingsHeader />
        <OpeningSettingsContent />
      </>
    </NewPageLayout>
  );
}
