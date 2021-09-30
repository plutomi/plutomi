import SignedInNav from "../../../../../components/Navbar/SignedInNav";
import { useSession } from "next-auth/client";
import useUser from "../../../../../SWR/useUser";
import Loader from "../../../../../components/Loader";
import axios from "axios";
import { mutate } from "swr";
import OpeningSettingsHeader from "../../../../../components/Openings/OpeningSettingsHeader";
import SignIn from "../../../../../components/SignIn";
import useOpeningById from "../../../../../SWR/useOpeningById";
import { useRouter } from "next/router";
import useStageById from "../../../../../SWR/useStageById";
import OpeningSettingsContent from "../../../../../components/Openings/OpeningSettingsContent";
import StageSettingsHeader from "../../../../../components/Stages/StageSettingsHeader";
import StageSettingsContent from "../../../../../components/Stages/StagesSettingsContent";
export default function OpeningsSettings() {
  const router = useRouter();
  const { opening_id, stage_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id as string
  );
  const { stage, isStageLoading, isStageError } = useStageById(
    user?.user_id,
    opening?.opening_id,
    stage_id as string
  );

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) {
    return <Loader text="Loading..." />;
  }

  // If no session or bad userid
  if (!session || isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings/${opening_id}/settings`} // TODO set this
        desiredPage={"your opening"} // TODO set this
      />
    );
  }

  if (isUserLoading) {
    return <Loader text="Loading user..." />;
  }

  if (isOpeningLoading) {
    return <Loader text="Loading opening..." />;
  }

  if (isStageLoading) {
    return <Loader text="Loading stage info..." />;
  }

  const deleteStage = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this stage? This cannot be reversed!"
      )
    )
      return;
    try {
      const { data } = await axios.delete(
        `/api/openings/${opening_id}/stages/${stage_id}`
      );
      alert(data.message);

      /** Scenario 1 - Stage deleted is the only stage
       * 1. Questionnaire <-- Gets deleted
       * We want to redirect to the create a stage page of the opening
       */
      const remaining_stages_before_delete = opening.stage_order;

      if (remaining_stages_before_delete.length == 1) {
        router.push(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings/${opening_id}/stages`
        );
      }

      /** Total Stages
       * 1. Questionnaire
       * 2. Set Up Profile  <-- Gets deleted
       */
      // Else, remove the deleted stage id from the stage order
      const index_of_deleted = remaining_stages_before_delete.indexOf(
        stage_id as string
      );
      remaining_stages_before_delete.splice(index_of_deleted, 1);

      /** Current State
       * 1. Questionnaire
       */

      // Then redirect to that stage's settings page
      router.push(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings/${opening_id}/stages/${remaining_stages_before_delete[0]}/settings`
      );
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh the stage_order
    mutate(`/api/openings/${opening_id}`);

    // Refresh the stage list
    mutate(`/api/openings/${opening_id}/stages`);
  };

  return (
    <>
      <SignedInNav current="Openings" />
      <div className="max-w-7xl mx-auto p-4 my-6 rounded-lg min-h-screen ">
        <header>
          <StageSettingsHeader deleteStage={deleteStage} />
        </header>

        <main className="mt-5">
          <StageSettingsContent />
        </main>
      </div>
    </>
  );
}
