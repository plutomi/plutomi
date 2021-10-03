import SignedInNav from "../../../../components/Navbar/SignedInNav";
import { useSession } from "next-auth/client";
import useUser from "../../../../SWR/useUser";
import Loader from "../../../../components/Loader";
import EmptyStagesState from "../../../../components/Stages/EmptyStagesState";
import SignIn from "../../../../components/SignIn";
import axios from "axios";
import { mutate } from "swr";
import { useRouter } from "next/router";
import StageModal from "../../../../components/Stages/StageModal";
import useStore from "../../../../utils/store";
import StagesHeader from "../../../../components/Stages/StagesHeader";
import useAllStagesInOpening from "../../../../SWR/useAllStagesInOpening";
import useOpeningById from "../../../../SWR/useOpeningById";
export default function Openings() {
  const router = useRouter();
  const { opening_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    session?.user_id,
    opening_id as string
  );

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    session?.user_id,
    opening?.opening_id
  );

  const stageModal = useStore((state: PlutomiState) => state.stageModal);
  const setStageModal = useStore((state: PlutomiState) => state.setStageModal);

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) {
    return <Loader text="Loading..." />;
  }

  // If no session or bad userid
  if (!session || isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings`} // TODO set this
        desiredPage={"your stages"} // TODO set this
      />
    );
  }

  // Redirect to the first stage
  if (stages && stages.length > 0) {
    router.push(
      `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings/${opening_id}/stages/${stages[0].stage_id}`
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
