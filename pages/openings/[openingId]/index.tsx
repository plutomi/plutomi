import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useSelf from '../../../SWR/useSelf';
import Loader from '../../../components/Loader';
import useAllStagesInOpening from '../../../SWR/useAllStagesInOpening';
import useOpeningInfo from '../../../SWR/useOpeningInfo';
import { CustomQuery } from '../../../types/main';
import { DOMAIN_NAME } from '../../../Config';

export default function Openings() {
  const router = useRouter();
  const { openingId } = router.query as Pick<CustomQuery, 'openingId'>;

  const { opening, isOpeningLoading, isOpeningError } = useOpeningInfo(openingId);

  const { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(opening?.openingId);

  // This page just redirects to the specified pages below !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  useEffect(() => {
    if (!router.isReady) return;

    // Redirect to the first stage
    if (opening?.totalStages > 0) {
      router.push(
        `${DOMAIN_NAME}/openings/${openingId}/stages/${stages[0].stageId}/applicants`, // TODO should this end with applicants?
      );
    } else {
      // Redirect to opening settings if no stages
      router.push(`${DOMAIN_NAME}/openings/${openingId}/settings`);
    }
  }, [router.isReady, opening?.totalStages, openingId, router, stages]);

  return <Loader text="Redirecting..." />;
}
