import SignedInNav from "../../../../../components/Navbar/SignedInNav";
import useSelf from "../../../../../SWR/useSelf";
import Loader from "../../../../../components/Loader";
import { mutate } from "swr";
import useOpeningById from "../../../../../SWR/useOpeningById";
import { useRouter } from "next/router";
import OpeningsService from "../../../../../adapters/OpeningsService";
import StageSettingsHeader from "../../../../../components/Stages/StageSettingsHeader";
import StageSettingsContent from "../../../../../components/Stages/StagesSettingsContent";
import StagesService from "../../../../../adapters/StagesService";
import NewPage from "../../../../../components/Templates/NewPage";
import useStageById from "../../../../../SWR/useStageById";
export default function StageSettings() {
  const router = useRouter();
  const { openingId, stageId } = router.query as CustomQuery;

  const { user, isUserLoading, isUserError } = useSelf();
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(openingId);
  let { stage, isStageLoading, isStageError } = useStageById(stageId);

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
        openingId: openingId,
        stageId: stageId,
      });
      router.push(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/openings/${openingId}/settings`
      );
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh the stageOrder
    mutate(OpeningsService.getOpeningURL({ openingId: openingId }));

    // Refresh the stage list
    mutate(
      OpeningsService.getAllStagesInOpeningURL({
        openingId: openingId,
      })
    );
  };

  return (
    <NewPage
      loggedOutPageText={"Log in to view your stage settings"}
      currentNavbarItem={"Openings"}
      headerText={
        isOpeningLoading
          ? "Settings"
          : `${opening?.GSI1SK} > ${stage?.GSI1SK} - Settings`
      }
    >
      <>
        <StageSettingsHeader deleteStage={deleteStage} />

        <StageSettingsContent />
      </>
    </NewPage>
  );
}
