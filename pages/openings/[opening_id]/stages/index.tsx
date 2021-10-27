import useSelf from "../../../../SWR/useSelf";
import Loader from "../../../../components/Loader";
import { useRouter } from "next/router";
import useAllStagesInOpening from "../../../../SWR/useAllStagesInOpening";
import useOpeningById from "../../../../SWR/useOpeningById";
import { useEffect } from "react";
export default function Openings() {
  const router = useRouter();
  const { opening_id } = router.query as CustomQuery;

  const { user, isUserLoading, isUserError } = useSelf();

  let { opening, isOpeningLoading, isOpeningError } =
    useOpeningById(opening_id);

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    opening?.opening_id
  );

  // This page just redirects to the specified pages below !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  useEffect(() => {
    if (!router.isReady) return;

    // Redirect to the first stage
    if (opening.total_stages > 0) {
      router.push(
        `${process.env.WEBSITE_URL}/openings/${opening_id}/stages/${stages[0].stage_id}/applicants` // TODO should this end with applicants?
      );
    } else {
      // Redirect to opening settings if no stages
      router.push(`${process.env.WEBSITE_URL}/openings/${opening_id}/settings`);
    }
  }, [router.isReady]);

  return <Loader text="Redirecting..." />;
}
