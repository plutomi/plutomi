import { useRouter } from "next/router";
import { mutate } from "swr";
import StageReorderColumn from "../StageReorderColumn";
import difference from "../../utils/getObjectDifference";
import OpeningModal from "./OpeningModal";
import Loader from "../Loader";
import useStore from "../../utils/store";
import useOpeningById from "../../SWR/useOpeningById";
import OpeningsService from "../../adapters/OpeningsService";
import { CUSTOM_QUERY } from "../../types/main";
export default function OpeningSettingsContent() {
  const router = useRouter();
  const { openingId } = router.query as Pick<CUSTOM_QUERY, "openingId">;
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(openingId);

  const openingModal = useStore((state) => state.openingModal);
  const setOpeningModal = useStore((state) => state.setOpeningModal);

  if (isOpeningLoading) {
    return <Loader text="Loading opening settings..." />;
  }

  const updateOpening = async () => {
    try {
      // Get the difference between the opening returned from SWR
      // And the opening modal inputs / edits
      const diff = difference(opening, openingModal);

      // Delete the two modal controlling keys
      delete diff["isModalOpen"];
      delete diff["modalMode"];

      console.log("Outgoing body", diff);

      const { message } = await OpeningsService.updateOpening(openingId, diff);
      alert(message);
      setOpeningModal({
        isModalOpen: false,
        modalMode: "CREATE",
        isPublic: false,
        openingId: "",
        GSI1SK: "",
      });
    } catch (error) {
      alert(error.response.data.message);
    }
    // Refresh opening data
    mutate(OpeningsService.getOpeningURL(openingId));
  };

  return (
    <>
      <OpeningModal updateOpening={updateOpening} />

      {/* 3 column wrapper */}
      <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
        {/* Left sidebar & main wrapper */}
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
