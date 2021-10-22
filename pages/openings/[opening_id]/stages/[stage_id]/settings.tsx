import SignedInNav from "../../../../../components/Navbar/SignedInNav";
<<<<<<< HEAD
=======
import { useSession } from "next-auth/client";
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
import useSelf from "../../../../../SWR/useSelf";
import Loader from "../../../../../components/Loader";
import { mutate } from "swr";
import Login from "../../../../../components/Login";
import useOpeningById from "../../../../../SWR/useOpeningById";
import { useRouter } from "next/router";
import OpeningsService from "../../../../../adapters/OpeningsService";
import StageSettingsHeader from "../../../../../components/Stages/StageSettingsHeader";
import StageSettingsContent from "../../../../../components/Stages/StagesSettingsContent";
import StagesService from "../../../../../adapters/StagesService";
export default function StageSettings() {
  const router = useRouter();
<<<<<<< HEAD
<<<<<<< HEAD
  const { opening_id, stage_id } = router.query as CustomQuery;
=======
  const { opening_id, stage_id } = router.query;
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
=======
  const { opening_id, stage_id } = router.query as CustomQuery;
>>>>>>> ce0b1d8 (fix: Removed all 'as string' - #196)

  const { user, isUserLoading, isUserError } = useSelf();
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id
  );

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && isUserLoading) {
    return <Loader text="Loading..." />;
  }

  if (isUserError) {
    return (
<<<<<<< HEAD
<<<<<<< HEAD
      <Login
        desiredPageText={"your stage settings"} // TODO set this
=======
      <SignIn
        callbackUrl={`${process.env.PLUTOMI_URL}/openings/${opening_id as string}/settings`} // TODO set this
        desiredPage={"your stage settings"} // TODO set this
>>>>>>> 73b8a24 (fixed wrong callback url on signin)
=======
      <Login
        desiredPageText={"your stage settings"} // TODO set this
>>>>>>> d64c806 (Got rid of callback url on login component)
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
      await StagesService.deleteStage({
        opening_id: opening_id,
        stage_id: stage_id,
      });
      router.push(`${process.env.PLUTOMI_URL}/openings/${opening_id}/settings`);
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh the stage_order
    mutate(OpeningsService.getOpeningURL({ opening_id: opening_id }));

    // Refresh the stage list
    mutate(
      OpeningsService.getAllStagesInOpeningURL({
        opening_id: opening_id,
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
