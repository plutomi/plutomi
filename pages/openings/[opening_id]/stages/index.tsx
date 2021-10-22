import SignedInNav from "../../../../components/Navbar/SignedInNav";
<<<<<<< HEAD
=======
import { useSession } from "next-auth/client";
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
import useSelf from "../../../../SWR/useSelf";
import Loader from "../../../../components/Loader";
import EmptyStagesState from "../../../../components/Stages/EmptyStagesState";
import Login from "../../../../components/Login";
import { useRouter } from "next/router";
import useStore from "../../../../utils/store";
import StagesHeader from "../../../../components/Stages/StagesHeader";
import useAllStagesInOpening from "../../../../SWR/useAllStagesInOpening";
import useOpeningById from "../../../../SWR/useOpeningById";
export default function Openings() {
  const router = useRouter();
<<<<<<< HEAD
  const { opening_id } = router.query as CustomQuery;
=======
  const { opening_id } = router.query;
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)

  const { user, isUserLoading, isUserError } = useSelf();

  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id
  );

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    user?.user_id,
    opening?.opening_id
  );

  const stageModal = useStore((state: PlutomiState) => state.stageModal);
  const setStageModal = useStore((state: PlutomiState) => state.setStageModal);

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && isUserLoading) {
    return <Loader text="Loading..." />;
  }

  if (isUserError) {
    return (
      <Login
        desiredPageText={"your stages"} // TODO set this
      />
    );
  }

  // Redirect to the first stage
  if (stages && stages.length > 0) {
    router.push(
      `${process.env.PLUTOMI_URL}/openings/${opening_id}/stages/${stages[0].stage_id}/applicants` // TODO should this end with applicants?
    );
    return <Loader text="Loading stages..." />;
  }

  // !!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!
  // Users will get redirected to the first stage, this shouldn't be used
  return (
    <>
      <SignedInNav current="Openings" />
      <div className="max-w-7xl mx-auto p-4 my-6 rounded-lg min-h-screen ">
        <header>
          <StagesHeader />
        </header>

        <main className="mt-5">
          {stages?.length > 0 ? (
            <Loader text="Loading stages..." /> // Not this one (loader bug)
          ) : (
            <EmptyStagesState />
          )}
        </main>
      </div>
    </>
  );
}
