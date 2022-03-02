import { useRouter } from "next/router";
import StageReorderColumn from "../StageReorderColumn";
import useQuestionsInOrg from "../../SWR/useQuestionsInOrg";
import Loader from "../Loader";
import useSelf from "../../SWR/useSelf";
import useAllStagesInOpening from "../../SWR/useAllStagesInOpening";
import useOpeningInfo from "../../SWR/useOpeningInfo";
import useStageInfo from "../../SWR/useStageInfo";
import useQuestionsInStage from "../../SWR/useQuestionsInStage";
import { CUSTOM_QUERY } from "../../types/main";
import StageSettingsQuestionList from "./StageSettingsQuestionList";
import { useEffect, useState, Fragment, FormEvent } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DynamoQuestion } from "../../types/dynamo";
import * as Questions from "../../adapters/Questions";
import { mutate } from "swr";
import combineClassNames from "../../utils/combineClassNames";
import * as Stages from "../../adapters/Stages";

const tabs = [{ name: "Questions" }, { name: "Webhooks" }];

// TODo this function is being repeated in multiple components now
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function StageSettingsContent() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState("Questions");
  const [localSearch, setLocalSearch] = useState("");
  let { orgQuestions, isOrgQuestionsLoading, isOrgQuestionsError } =
    useQuestionsInOrg();
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
                  <div>
                    <div className="sm:hidden">
                      <label htmlFor="tabs" className="sr-only">
                        Select a tab
                      </label>
                      {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
                      <select
                        id="tabs"
                        name="tabs"
                        className="block w-full focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                        defaultValue={
                          tabs.find((tab) => tab.name === currentTab).name
                        }
                      >
                        {tabs.map((tab) => (
                          <option key={tab.name}>{tab.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="hidden sm:block">
                      <div className="border-b border-gray-200">
                        <nav className="-mb-px flex" aria-label="Tabs">
                          {tabs.map((tab) => (
                            <button
                              key={tab.name}
                              onClick={() => setCurrentTab(tab.name)}
                              className={classNames(
                                tab.name === currentTab
                                  ? "border-blue-500 text-blue-600"
                                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                                "w-1/2 py-4 px-1 text-center border-b-2 font-medium text-lg"
                              )}
                              aria-current={
                                tab.name === currentTab ? "page" : undefined
                              }
                            >
                              {tab.name}
                            </button>
                          ))}
                        </nav>
                      </div>
                    </div>
                  </div>

                  {currentTab === "Questions" ? (
                    <StageSettingsQuestionList />
                  ) : (
                    <h1>Webhooks</h1>
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
