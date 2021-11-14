import useSelf from "../../../../SWR/useSelf";
import Loader from "../../../../components/Loader";
import { useRouter } from "next/router";
import useAllStagesInOpening from "../../../../SWR/useAllStagesInOpening";
import useOpeningById from "../../../../SWR/useOpeningById";
import { useEffect } from "react";
export default function Openings() {
  const router = useRouter();
  const { openingId }: Partial<CustomQuery> = router.query;

  const { user, isUserLoading, isUserError } = useSelf();

  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(openingId);

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    opening?.openingId
  );

  // This page just redirects to the specified pages below !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  useEffect(() => {
    if (!router.isReady) return;

    // Redirect to the first stage
    if (opening.totalStages > 0) {
      router.push(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/openings/${openingId}/stages/${stages[0].stageId}/applicants` // TODO should this end with applicants?
      );
    } else {
      // Redirect to opening settings if no stages
      router.push(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/openings/${openingId}/settings`
      );
    }
  }, [router.isReady]);

  return <Loader text="Redirecting..." />;
}
