import { useRouter } from "next/router";
import StageReorderColumn from "../StageReorderColumn";
import useAllQuestions from "../../SWR/useAllQuestions";
import Loader from "../Loader";
import useSelf from "../../SWR/useSelf";
import useAllStagesInOpening from "../../SWR/useAllStagesInOpening";
import useOpeningInfo from "../../SWR/useOpeningInfo";
import useStageInfo from "../../SWR/useStageInfo";
import { CUSTOM_QUERY } from "../../types/main";
import { PlusIcon } from "@heroicons/react/solid";
import { useState } from "react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const tabs = [
  { id: 1, name: "Questions" },
  { id: 2, name: "Rules (TODO)?" },
  // { id: 3, name: "Messages" }, // TODO add get messages (Twilio)
];

export default function StageSettingsContent() {
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState("");
  const [currentActive, setCurrentActive] = useState(1); // Id of item
  const { openingId, stageId } = router.query as Pick<
    CUSTOM_QUERY,
    "openingId" | "stageId"
  >;

  const { user, isUserLoading, isUserError } = useSelf();
  let { opening, isOpeningLoading, isOpeningError } = useOpeningInfo(openingId);

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    opening?.openingId
  );
  const { stage, isStageLoading, isStageError } = useStageInfo(
    openingId,
    stageId
  );

  if (isOpeningLoading) {
    return <Loader text="Loading opening..." />;
  }

  if (isStagesLoading) {
    // TODO i think here we should render the column
    return <Loader text="Loading stages..." />;
  }

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
              <div className="relative h-full" style={{ minHeight: "36rem" }}>
                <div className=" inset-0  border-gray-200 rounded-lg">
                  <div className="flex flex-col justify-center items-center">
                    <nav
                      className="-mb-px flex w-full "
                      x-descriptions="Tab component"
                    >
                      {tabs.map((tab) => (
                        // TODO this is a mess
                        <button
                          onClick={() => setCurrentActive(tab.id)}
                          key={tab.name}
                          className={classNames(
                            tab.id === currentActive
                              ? "border-blue-500 text-blue-600"
                              : "border-transparent text-normal hover:text-dark hover:border-blue-gray-300 transition ease-in-out duration-200",
                            "text-center w-full cursor-pointer whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-lg"
                          )}
                        >
                          {tab.name}
                        </button>
                      ))}
                    </nav>
                    {/* <input
                      type="text"
                      name="search"
                      id="search"
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)} // TODO
                      placeholder={"Search for an question to add to this stage..."}
                      className="w-2/3 shadow-sm focus:ring-blue-500 focus:border-blue-500 block  border sm:text-sm border-gray-300 rounded-md"
                    /> */}
                  </div>
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
