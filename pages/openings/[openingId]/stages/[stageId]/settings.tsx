import { mutate } from 'swr';
import { useRouter } from 'next/router';
import { useOpeningInfo } from '../../../../../SWR/useOpeningInfo';
import { useStageInfo } from '../../../../../SWR/useStageInfo';
import { CustomQuery } from '../../../../../types/main';
import { GetOpeningInfoURL } from '../../../../../adapters/Openings';
import { GetStagesInOpeningURL, DeleteStage } from '../../../../../adapters/Stages';
import { WEBSITE_URL } from '../../../../../Config';
import { NewPageLayout } from '../../../../../components/NewPageLayout';
import { StageSettingsHeader } from '../../../../../components/StageSettingsHeader';
import { StageSettingsContent } from '../../../../../components/StageSettingsContent';

export default function StageSettings() {
  const router = useRouter();
  const { openingId, stageId } = router.query as Pick<CustomQuery, 'openingId' | 'stageId'>;
  const { opening, isOpeningLoading, isOpeningError } = useOpeningInfo({ openingId });
  const { stage, isStageLoading, isStageError } = useStageInfo({ openingId, stageId });

  // Update this to use the new update syntax with diff
  const deleteStage = async () => {
    if (!confirm('Are you sure you want to delete this stage? This action cannot be reversed!')) {
      return;
    }

    if (!confirm('Are you sure?')) {
      return;
    }
    try {
      await DeleteStage({
        openingId,
        stageId,
      });
      router.push(`${WEBSITE_URL}/openings/${openingId}/settings`);
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh the stageOrder
    mutate(GetOpeningInfoURL(openingId));

    // Refresh the stage list
    mutate(GetStagesInOpeningURL(openingId));
  };

  return (
    <NewPageLayout
      loggedOutPageText="Log in to view your stage settings"
      currentNavbarItem="Openings"
      headerText={
        isStageLoading
          ? 'Loading settings...'
          : `${opening?.openingName} > ${stage?.GSI1SK} - Settings`
      }
    >
      <>
        <StageSettingsHeader deleteStage={deleteStage} />
        <StageSettingsContent />
      </>
    </NewPageLayout>
  );
}
