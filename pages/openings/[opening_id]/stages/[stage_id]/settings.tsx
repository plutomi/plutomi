import SignedInNav from "../../../../../components/Navbar/SignedInNav";
import { useSession } from "next-auth/client";
import useUser from "../../../../../SWR/useUser";
import Loader from "../../../../../components/Loader";
import axios from "axios";
import { mutate } from "swr";
import SignIn from "../../../../../components/SignIn";
import useOpeningById from "../../../../../SWR/useOpeningById";
import { useRouter } from "next/router";
import useStageById from "../../../../../SWR/useStageById";
import OpeningsService from "../../../../../Services/OpeningsService";
import StageSettingsHeader from "../../../../../components/Stages/StageSettingsHeader";
import StageSettingsContent from "../../../../../components/Stages/StagesSettingsContent";
import StagesService from "../../../../../Services/StagesService";
export default function OpeningsSettings() {
  const router = useRouter();
  const { opening_id, stage_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id as string
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
        desiredPage={"your stage settings"} // TODO set this
      />
    );
  }

  if (isUserLoading) {
    return <Loader text="Loading user..." />;
  }

  if (isOpeningLoading) {
    return <Loader text="Loading opening..." />;
  }

  // Update this to use the new update syntax with diff
  const deleteStage = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this stage? This action cannot be reversed!"
      )
    ) {
      return;
    }

    if (!confirm("Are you sure?")) {
      return;
    }
    try {
      await axios.delete(`/api/openings/${opening_id}/stages/${stage_id}`);
      router.push(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings/${opening_id}/settings`
      );
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh the stage_order
    mutate(OpeningsService.getOpeningURL({ opening_id: opening_id as string }));

    // Refresh the stage list
    mutate(
      StagesService.getAllStagesInOpeningURL({
        opening_id: opening_id as string,
      })
    );
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
