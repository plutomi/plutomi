import { useRouter } from "next/router";
import { mutate } from "swr";
import StageReorderColumn from "../StageReorderColumn";

import { GetRelativeTime } from "../../utils/time";
import difference from "../../utils/getObjectDifference";
import { useEffect } from "react";
import OpeningModal from "./OpeningModal";
import Loader from "../Loader";
import useSelf from "../../SWR/useSelf";
import { useState } from "react";
import useStore from "../../utils/store";
import useAllStagesInOpening from "../../SWR/useAllStagesInOpening";
import useOpeningById from "../../SWR/useOpeningById";
import OpeningsService from "../../adapters/OpeningsService";
export default function OpeningSettingsContent() {
  const router = useRouter();
  const { opening_id } = router.query as CustomQuery;

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

  const openingModal = useStore((state: PlutomiState) => state.openingModal);
  const setOpeningModal = useStore(
    (state: PlutomiState) => state.setOpeningModal
  );
  const [new_stages, setNewStages] = useState(stages);

  useEffect(() => {
    setNewStages(stages);
  }, [stages]);

  if (isOpeningLoading) {
    return <Loader text="Loading opening..." />;
  }

  if (isStagesLoading) {
    return <Loader text="Loading stages..." />;
  }

  const updateOpening = async () => {
    try {
      // Get the difference between the opening returned from SWR
      // And the opening modal inputs / edits
      const diff = difference(opening, openingModal);

      // Delete the two modal controlling keys
      delete diff["is_modal_open"];
      delete diff["modal_mode"];

      console.log("Outgoing body", diff);

      const { message } = await OpeningsService.updateOpening({
        opening_id: opening_id,
        new_opening_values: diff,
      });
      alert(message);
      setOpeningModal({
        is_modal_open: false,
        modal_mode: "CREATE",
        is_public: false,
        opening_id: "",
        GSI1SK: "",
      });
    } catch (error) {
      alert(error.response.data.message);
    }
    // Refresh opening data
    mutate(OpeningsService.getOpeningURL({ opening_id: opening_id }));
  };

  return (
    <>
      {/* 3 column wrapper */}
      <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
        {/* Left sidebar & main wrapper */}
        <OpeningModal updateOpening={updateOpening} />
        <div className="flex-1 min-w-0 bg-white xl:flex">
          <div className="border-b border-gray-200 xl:border-b-0 xl:flex-shrink-0 xl:w-64 xl:border-r xl:border-gray-200 bg-white">
            <div className="h-full pl-4 pr-6 py-6 sm:pl-6 lg:pl-8 xl:pl-0">
              {/* Start left column area */}
              <StageReorderColumn />
              {/* End left column area */}
            </div>
          </div>

          <div className="bg-white lg:min-w-0 lg:flex-1">
            <div className="h-full py-6 px-4 sm:px-6 lg:px-8">
              {/* Start main area*/}
              <div className="relative h-full" style={{ minHeight: "36rem" }}>
                <div className=" inset-0  border-gray-200 rounded-lg">
                  <div className="flex flex-col justify-center items-center"></div>
                </div>
              </div>
              {/* End main area */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
