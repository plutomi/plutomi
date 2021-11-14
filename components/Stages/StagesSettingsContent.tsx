import { useRouter } from "next/router";
import { mutate } from "swr";
import difference from "../../utils/getObjectDifference";
import StageReorderColumn from "../StageReorderColumn";
import QuestionList from "../Questions/QuestionList";
import useStore from "../../utils/store";
import QuestionModal from "../Questions/QuestionModal";
import useAllStageQuestions from "../../SWR/useAllStageQuestions";
import Loader from "../Loader";
import useSelf from "../../SWR/useSelf";
import useAllStagesInOpening from "../../SWR/useAllStagesInOpening";
import useOpeningById from "../../SWR/useOpeningById";
import useStageById from "../../SWR/useStageById";
import StagesService from "../../adapters/StagesService";
import QuestionsService from "../../adapters/QuestionsService";
import { CustomQuery } from "../../additional";
CustomQuery;
export default function StageSettingsContent() {
  const createQuestion = async () => {
    try {
      const { message } = await QuestionsService.createQuestion(
        questionModal.GSI1SK,
        stageId,
        questionModal.questionDescription
      );

      alert(message);
      setQuestionModal({
        isModalOpen: false,
        modalMode: "CREATE",
        questionId: "",
        questionDescription: "",
        GSI1SK: "",
      });
    } catch (error) {
      console.error(`Error creating`, error);
      alert(error.response.data.message);
    }

    // Refresh the questionOrder
    mutate(StagesService.getStageURL(stageId));

    // Refresh the question list
    mutate(StagesService.getAllQuestionsInStageURL(stageId));
  };

  const updateQuestion = async () => {
    try {
      const question = questions.find(
        (question) => question?.questionId == questionModal.questionId
      );

      // Get the difference between the question returned from SWR
      // And the updated question in the modal
      const diff = difference(question, questionModal);

      // Delete the two modal controlling keys
      delete diff["isModalOpen"];
      delete diff["modalMode"];

      console.log(`Difference between the two objects`, diff);

      const { message } = await QuestionsService.updateQuestion(
        questionModal.questionId,
        diff
      );
      setQuestionModal({
        isModalOpen: false,
        modalMode: "CREATE",
        questionId: "",
        questionDescription: "",
        GSI1SK: "",
      });

      alert(message);
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh the questionOrder
    mutate(StagesService.getStageURL(stageId));

    // Refresh the question list
    mutate(StagesService.getAllQuestionsInStageURL(stageId));
  };

  const router = useRouter();
  const { openingId, stageId }: Partial<CustomQuery> = router.query;

  const { user, isUserLoading, isUserError } = useSelf();
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(openingId);

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    opening?.openingId
  );
  const stageModal = useStore((state) => state.stageModal);
  const setStageModal = useStore((state) => state.setStageModal);

  const { stage, isStageLoading, isStageError } = useStageById(stageId);

  const { questions, isQuestionsLoading, isQuestionsError } =
    useAllStageQuestions(user?.orgId, stage?.stageId);

  const questionModal = useStore((state) => state.questionModal);
  const setQuestionModal = useStore((state) => state.setQuestionModal);

  if (isOpeningLoading) {
    return <Loader text="Loading opening..." />;
  }

  if (isStagesLoading) {
    // TODO i think here we should render the column
    return <Loader text="Loading stages..." />;
  }

  return (
    <>
      <QuestionModal
        createQuestion={createQuestion}
        updateQuestion={updateQuestion}
      />

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
                    <div className="flex justify-center space-x-4 py-2 items-center"></div>
                  </div>
                </div>

                <QuestionList />
              </div>
              {/* End main area */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
