import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useStore from '../../../../../utils/store';
import StagesHeader from '../../../../../components/Stages/StagesHeader';
import StageCarousel from '../../../../../components/Stages/StagesCarousel';
import useAllStagesInOpening from '../../../../../SWR/useAllStagesInOpening';
import ApplicantList from '../../../../../components/Applicants/ApplicantList';
import ApplicantProfileModal from '../../../../../components/Applicants/ApplicantProfileModal';
import NewPage from '../../../../../components/Templates/NewPage';
import useOpeningInfo from '../../../../../SWR/useOpeningInfo';
import { CUSTOM_QUERY } from '../../../../../types/main';
export default function StageApplicants() {
  const router = useRouter();
  const { openingId, stageId } = router.query as Pick<CUSTOM_QUERY, 'openingId' | 'stageId'>;
  let { opening, isOpeningLoading, isOpeningError } = useOpeningInfo(openingId);

  const { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(opening?.openingId);

  const openApplicantProfileModal = useStore((state) => state.openApplicantProfileModal);
  // Allows for copying the URL of the applicant directly directly
  useEffect(() => {
    if (!router.isReady) return;
    const { applicantId } = router.query as Pick<CUSTOM_QUERY, 'applicantId'>;

    if (applicantId && typeof applicantId === 'string' && applicantId !== '') {
      openApplicantProfileModal();
    }
  }, [router.isReady]);

  return (
    <NewPage
      loggedOutPageText={'Log in to view your applicants'}
      currentNavbarItem={'Openings'}
      headerText={isOpeningLoading ? 'Applicants' : `${opening?.openingName} - Applicants`}
    >
      <>
        <ApplicantProfileModal />

        <div className="space-y-10">
          <StagesHeader />
          <div className="space-y-10">
            <StageCarousel />
            <ApplicantList />
          </div>
        </div>
      </>
    </NewPage>
  );
}
