import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useStore from '../../../../../utils/store';
import { useAllStagesInOpening } from '../../../../../SWR/useAllStagesInOpening';
import { useOpeningInfo } from '../../../../../SWR/useOpeningInfo';
import { CustomQuery } from '../../../../../types/main';
import { NewPageLayout } from '../../../../../components/NewPageLayout';
import { ApplicantProfileModal } from '../../../../../components/ApplicantProfileModal';
import { ApplicantList } from '../../../../../components/ApplicantList';
import { StageCarousel } from '../../../../../components/StageCarousel';
import { ApplicantsPageHeader } from '../../../../../components/ApplicantsPageHeader';

export default function StageApplicants() {
  const router = useRouter();
  const { openingId } = router.query as Pick<CustomQuery, 'openingId'>;
  const { opening, isOpeningLoading, isOpeningError } = useOpeningInfo({ openingId });

  const openApplicantProfileModal = useStore((state) => state.openApplicantProfileModal);
  // Allows for copying the URL of the applicant directly directly
  useEffect(() => {
    if (!router.isReady) return;
    const { applicantId } = router.query as Pick<CustomQuery, 'applicantId'>;

    if (applicantId && typeof applicantId === 'string' && applicantId !== '') {
      openApplicantProfileModal();
    }
  }, [router.isReady, openApplicantProfileModal, router.query]);

  return (
    <NewPageLayout
      loggedOutPageText="Log in to view your applicants"
      currentNavbarItem="Openings"
      headerText={isOpeningLoading ? 'Applicants' : `${opening?.name} - Applicants`}
    >
      <>
        <ApplicantProfileModal />

        <div className="space-y-10">
          <ApplicantsPageHeader />
          <div className="space-y-10">
            <StageCarousel />
            <ApplicantList />
          </div>
        </div>
      </>
    </NewPageLayout>
  );
}
