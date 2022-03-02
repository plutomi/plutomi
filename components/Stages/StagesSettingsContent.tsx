import { useRouter } from "next/router";
import StageReorderColumn from "../StageReorderColumn";
import Loader from "../Loader";
import useAllStagesInOpening from "../../SWR/useAllStagesInOpening";
import useOpeningInfo from "../../SWR/useOpeningInfo";
import { CUSTOM_QUERY } from "../../types/main";
import StageSettingsQuestionList from "./StageSettingsQuestionList";
import { useState } from "react";
import StageSettingsContentTabs from "./StageSettingsContentTabs";
import WebhookList from "./WebhookList";
export default function StageSettingsContent() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState("Questions");
  const { openingId, stageId } = router.query as Pick<
    CUSTOM_QUERY,
    "openingId" | "stageId"
  >;

  let { opening, isOpeningLoading, isOpeningError } = useOpeningInfo(openingId);
  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    opening?.openingId
  );

  if (isOpeningLoading) {
    return <Loader text="Loading opening..." />;
  }

  if (isStagesLoading) {
    // TODO i think here we should render the column
    return <Loader text="Loading stages..." />;
  }

  const setNewTab = (value: string) => {
    if (value !== currentTab) {
      setCurrentTab(value);
    }
  };
  return (
    <>
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
              <StageSettingsContentTabs
                currentTab={currentTab}
                setCurrentTab={setNewTab}
              />
              <div className="relative h-full" style={{ minHeight: "36rem" }}>
                <div className=" inset-0  border-gray-200 rounded-lg">
                  {currentTab === "Questions" ? (
                    <StageSettingsQuestionList />
                  ) : (
                    <WebhookList />
                  )}
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
