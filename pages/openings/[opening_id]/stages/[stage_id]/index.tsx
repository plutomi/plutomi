import SignedInNav from "../../../../../components/Navbar/SignedInNav";
import { useSession } from "next-auth/client";
import useOpenings from "../../../../../SWR/useOpenings";
import useUser from "../../../../../SWR/useUser";
import Loader from "../../../../../components/Loader";
import EmptyStagesState from "../../../../../components/Stages/EmptyStagesState";
import SignIn from "../../../../../components/SignIn";
import axios from "axios";
import { mutate } from "swr";
import { useRouter } from "next/router";
import CreateStageModal from "../../../../../components/CreateStageModal";
import useStore from "../../../../../utils/store";
import StagesHeader from "../../../../../components/Stages/StagesHeader";
import EmptyOpeningsState from "../../../../../components/Openings/EmptyOpeningsState";
import StageCarousel from "../../../../../components/Stages/StagesCarousel";
import useStageById from "../../../../../SWR/useStageById";
import useAllStagesInOpening from "../../../../../SWR/useAllStagesInOpening";
export default function Openings() {
  const router = useRouter();
  const { opening_id, stage_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  const { stage, isStageLoading, isStageError } = useStageById(
    user?.user_id,
    opening_id as string,
    stage_id as string
  );

  const setCreateStageModalOpen = useStore(
    (state: PlutomiState) => state.setCreateStageModalOpen
  );

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) {
    return <Loader text="Loading..." />;
  }

  // If no session or bad userid
  if (!session || isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings`} // TODO set this
        desiredPage={"your openings"} // TODO set this
      />
    );
  }

  if (isUserLoading) {
    return <Loader text="Loading user..." />;
  }

  if (isStageLoading) {
    return <Loader text="Loading stage..." />;
  }

  const createStage = async (stage_name: string) => {
    const body: APICreateStageInput = {
      stage_name: stage_name,
    };
    try {
      const { data } = await axios.post(
        `/api/openings/${opening_id}/stages`,
        body
      );
      alert(data.message);
      setCreateStageModalOpen(false);
    } catch (error) {
      console.error("Error creating stage", error);
      alert(error.response.data.message);
    }

    // Refresh stage order
    mutate(`/api/openings/${opening_id}`);

    // Refresh stage list
    mutate(`/api/openings/${opening_id}/stages`);
  };

  return (
    <>
      <CreateStageModal createStage={createStage} />
      <SignedInNav current="Openings" />
      <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
        <header>
          <StagesHeader />
        </header>

        <main className="mt-32">
          {/* {stages.length == 0 ? <EmptyStagesState /> : <StageCarousel />} */}
          <h1>
            {opening_id} - {stage_id} - {stage.GSI1SK}
          </h1>
          <StageCarousel />
        </main>
      </div>
    </>
  );
}
