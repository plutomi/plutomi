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
import { useEffect, useState, Fragment, FormEvent } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/outline";
import { DynamoQuestion } from "../../types/dynamo";
import * as Questions from "../../adapters/Questions";
import { mutate } from "swr";

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
  const { orgQuestions, isOrgQuestionsLoading, isOrgQuestionsError } =
    useQuestionsInOrg();
  const { openingId, stageId } = router.query as Pick<
    CUSTOM_QUERY,
    "openingId" | "stageId"
  >;
  const { stageQuestions, isStageQuestionsLoading, isStageQuestionsError } =
    useQuestionsInStage({ openingId, stageId });

  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSearch = async () => {
    // TODO get all questions based on current localSearch text
    console.log(localSearch);
  };

  const handleAdd = async (question: DynamoQuestion) => {
    // TODO check if already exists in stage

    // If doesnt exist, add it.
    try {
      const { data } = await Questions.AddQuestionToStage({
        openingId,
        stageId,
        questionId: question.questionId,
      });

      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
    mutate(
      Questions.GetQuestionsInStageURL({
        openingId,
        stageId,
      })
    );
  };

  const handleRemove = async (question: DynamoQuestion) => {
    try {
      const { data } = await Questions.DeleteQuestionFromStage({
        openingId,
        stageId,
        questionId: question.questionId,
      });

      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
    mutate(
      Questions.GetQuestionsInStageURL({
        openingId,
        stageId,
      })
    );
  };
  useEffect(() => {
    handleSearch();
  }, [localSearch]);

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
                    <input
                      type="text"
                      name="search"
                      id="search"
                      value={localSearch}
                      onClick={() => setShow(true)}
                      // onClick={() => setShow(true)}
                      onBlur={() => setShow(false)}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      placeholder={
                        "Search for a question to add to this stage..."
                      }
                      className="mt-2  w-full shadow-sm focus:ring-blue-500 focus:border-blue-500   border sm:text-sm border-gray-300 rounded-md"
                    />
                    <Listbox
                      value={selected}
                      onChange={(question) => handleAdd(question)}
                    >
                      <>
                        <div className="mt-1 relative w-full">
                          <Transition
                            show={show}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                              {orgQuestions?.map((question: DynamoQuestion) => (
                                <Listbox.Option
                                  key={question.questionId}
                                  disabled={stage?.questionOrder.includes(
                                    question.questionId
                                  )}
                                  className={classNames(
                                    stage?.questionOrder.includes(
                                      question.questionId
                                    )
                                      ? "disabled text-gray-400 "
                                      : "hover:bg-blue-500 hover:text-white hover:cursor-pointer",
                                    "cursor-default select-none relative py-2 pl-3 pr-9 "
                                  )}
                                  value={question}
                                >
                                  <>
                                    <span className="">
                                      {question.GSI1SK}
                                      {stage?.questionOrder.includes(
                                        question.questionId
                                      ) && " - Already added"}
                                    </span>

                                    {stage?.questionOrder.includes(
                                      question.questionId
                                    ) && (
                                      <button
                                        onClick={() => handleRemove(question)}
                                        className="ml-8 px-2 py-1 right-0 border border-red-500 rounded-md text-red-500 bg-white hover:text-white hover:bg-red-500 transition ease-in duration-100"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </>
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </>
                    </Listbox>
                    <div className="w-full border m-4 bg-blue-50">
                      <p>ORG QUESTIONS:</p>
                      <div>
                        {orgQuestions?.map((question: DynamoQuestion) => {
                          return (
                            <p key={question.questionId}>{question.GSI1SK}</p>
                          );
                        })}
                      </div>
                    </div>
                    <div className="w-full border p-4 bg-purple-50">
                      <p>Stage QUESTIONS:</p>
                      <div>
                        {stageQuestions?.map((question: DynamoQuestion) => {
                          return (
                            <p key={question.questionId}>{question.GSI1SK}</p>
                          );
                        })}
                      </div>
                    </div>
                    <p>{JSON.stringify(stage)}</p>
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
