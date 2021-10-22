import SignedInNav from "../../../../../components/Navbar/SignedInNav";
<<<<<<< HEAD
=======
import { useSession } from "next-auth/client";
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
import useSelf from "../../../../../SWR/useSelf";
import Loader from "../../../../../components/Loader";
import EmptyStagesState from "../../../../../components/Stages/EmptyStagesState";
import Login from "../../../../../components/Login";
import { useEffect } from "react";
import { useRouter } from "next/router";
import useStore from "../../../../../utils/store";
import StagesHeader from "../../../../../components/Stages/StagesHeader";
import StageCarousel from "../../../../../components/Stages/StagesCarousel";
import useAllApplicantsInStage from "../../../../../SWR/useAllApplicantsInStage";
import useAllStagesInOpening from "../../../../../SWR/useAllStagesInOpening";
import ApplicantList from "../../../../../components/Applicants/ApplicantList";
import ApplicantProfileModal from "../../../../../components/Applicants/ApplicantProfileModal";
export default function StageID() {
  const router = useRouter();
<<<<<<< HEAD
  const { opening_id, stage_id, applicant_id } = router.query as CustomQuery;
=======
  const { opening_id, stage_id, applicant_id } = router.query;
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)

  const { user, isUserLoading, isUserError } = useSelf();

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    user?.user_id,
    opening_id
  );

  const { applicants, isApplicantsLoading, isApplicantsError } =
    useAllApplicantsInStage(opening_id, stage_id);

  const stageModal: StageModalInput = useStore(
    (state: PlutomiState) => state.stageModal
  );

  const setStageModal = useStore((state: PlutomiState) => state.setStageModal);

  const setApplicantProfileModal = useStore(
    (store: PlutomiState) => store.setApplicantProfileModal
  );

  const applicantProfileModal = useStore(
    (store: PlutomiState) => store.applicantProfileModal
  );

  // Allows for copying the URL of the applicant directly directly
  useEffect(() => {
    if (!router.isReady) return;
    const { applicant_id } = router.query as CustomQuery;

    if (
      applicant_id &&
      typeof applicant_id === "string" &&
      applicant_id !== ""
    ) {
      setApplicantProfileModal({
        ...applicantProfileModal,
        is_modal_open: true,
      });
    }
  }, [router.isReady]);

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && isUserLoading) {
    return <Loader text="Loading..." />;
  }

  if (isUserError) {
<<<<<<< HEAD
    return <Login desiredPageText={"your applicants"} />;
=======
    return (
      <SignIn
        callbackUrl={`${process.env.PLUTOMI_URL}/openings`} 
        desiredPage={"your applicants"} 
      />
    );
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
  }

  if (isUserLoading) {
    return <Loader text="Loading user..." />;
  }

  return (
    <>
      <ApplicantProfileModal />
      <SignedInNav current="Openings" />
      <div className="max-w-7xl mx-auto p-4 my-6 rounded-lg min-h-screen ">
        <header>
          <StagesHeader />
        </header>

        <main className="mt-5">
          {stages?.length == 0 ? (
            <EmptyStagesState />
          ) : (
            <div className="space-y-10">
              <StageCarousel />
              <ApplicantList />
            </div>
          )}
        </main>
      </div>
    </>
  );
}
