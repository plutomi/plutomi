import { useRouter } from "next/router";
import { mutate } from "swr";
import difference from "../../utils/getObjectDifference";
import { GetRelativeTime } from "../../utils/time";
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
export default function StageSettingsContent() {
  const createQuestion = async () => {
    try {
      const { message } = await QuestionsService.createQuestion({
        GSI1SK: questionModal.GSI1SK,
        stage_id: stage_id,
        question_description: questionModal.question_description,
      });

      alert(message);
      setQuestionModal({
        is_modal_open: false,
        modal_mode: "CREATE",
        question_id: "",
        question_description: "",
        GSI1SK: "",
      });
    } catch (error) {
      console.error(`Error creating`, error);
      alert(error.response.data.message);
    }

    // Refresh the question_order
    mutate(
      StagesService.getStageURL({
        stage_id: stage_id,
      })
    );

    // Refresh the question list
    mutate(StagesService.getAllQuestionsInStageURL({ stage_id }));
  };

  const updateQuestion = async () => {
    try {
      const question = questions.find(
        (question) => question?.question_id == questionModal.question_id
      );

      // Get the difference between the question returned from SWR
      // And the updated question in the modal
      const diff = difference(question, questionModal);

      // Delete the two modal controlling keys
      delete diff["is_modal_open"];
      delete diff["modal_mode"];

      console.log(`Difference between the two objects`, diff);

      const { message } = await QuestionsService.updateQuestion({
        question_id: questionModal.question_id,
        new_question_values: diff,
      });
      setQuestionModal({
        is_modal_open: false,
        modal_mode: "CREATE",
        question_id: "",
        question_description: "",
        GSI1SK: "",
      });

      alert(message);
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh the question_order
    mutate(
      StagesService.getStageURL({
        stage_id: stage_id,
      })
    );

    // Refresh the question list
    mutate(StagesService.getAllQuestionsInStageURL({ stage_id }));
  };

  const router = useRouter();
  const { opening_id, stage_id } = router.query as CustomQuery;

  const { user, isUserLoading, isUserError } = useSelf();
  let { opening, isOpeningLoading, isOpeningError } =
    useOpeningById(opening_id);

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    opening?.opening_id
  );
  const stageModal = useStore((state) => state.stageModal);
  const setStageModal = useStore((state) => state.setStageModal);

  const { stage, isStageLoading, isStageError } = useStageById(stage_id);

  const { questions, isQuestionsLoading, isQuestionsError } =
    useAllStageQuestions(user?.org_id, stage?.stage_id);

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
