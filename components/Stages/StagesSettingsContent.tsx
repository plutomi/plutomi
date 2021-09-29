import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
import { mutate } from "swr";
import Link from "next/dist/client/link";
import StageCard from "../Stages/StageCard";
import QuestionList from "../Questions/QuestionList";
import { useEffect } from "react";
import axios from "axios";
import useStore from "../../utils/store";
import CreateQuestionModal from "../CreateQuestionModal";
import useAllStageQuestions from "../../SWR/useAllStageQuestions";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableStageCard from "../../components/Stages/DraggableStageCard";
import Loader from "../Loader";
import useUser from "../../SWR/useUser";
import { useState } from "react";
import useAllStagesInOpening from "../../SWR/useAllStagesInOpening";
import useOpeningById from "../../SWR/useOpeningById";
import useStageById from "../../SWR/useStageById";
export default function StageSettingsContent() {
  const router = useRouter();
  const { opening_id, stage_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id as string
  );

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    session?.user_id,
    opening?.opening_id
  );
  const { stage, isStageLoading, isStageError } = useStageById(
    user?.user_id,
    opening?.opening_id,
    stage_id as string
  );

  const { questions, isQuestionsLoading, isQuestionsError } =
    useAllStageQuestions(user?.org_id, opening?.opening_id, stage?.stage_id);

  const [new_stages, setNewStages] = useState(stages);
  const [isStageOrderUpdating, setIsStageOrderUpdating] = useState(false);
  const [isQuestionOrderUpdating, setIsQuestionOrderUpdating] = useState(false);
  useEffect(() => {
    console.log("new stages", stages);
    setNewStages(stages);
  }, [stages]);

  const setCreateQuestionModalOpen = useStore(
    (state: PlutomiState) => state.setCreateQuestionModalOpen
  );

  if (isOpeningLoading) {
    return <Loader text="Loading opening..." />;
  }

  if (isStagesLoading) {
    return <Loader text="Loading stages..." />;
  }

  if (isStageLoading) {
    return <Loader text="Loading stage info..." />;
  }

  if (isQuestionsLoading) {
    return <Loader text="Loading questions..." />;
  }

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    // No change
    if (!destination) {
      return;
    }
    // If dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    setIsStageOrderUpdating(true);

    let new_stage_order = Array.from(opening.stage_order);
    new_stage_order.splice(source.index, 1);
    new_stage_order.splice(destination.index, 0, draggableId);
    let new_order = new_stage_order.map((i) =>
      stages.find((j) => j.stage_id === i)
    );

    setNewStages(new_order);

    try {
      const body = {
        updated_opening: { ...opening, stage_order: new_stage_order },
      };

      await axios.put(`/api/openings/${opening_id}`, body);
    } catch (error) {
      console.error(error.response.data.message);
    }

    mutate(`/api/openings/${opening_id}`); // Refresh the stage order
    setIsStageOrderUpdating(false);
  };

  const createQuestion = async ({ question_title, question_description }) => {
    const body: APICreateQuestionInput = {
      question_title: question_title,
      question_description: question_description,
    };
    try {
      const { data } = await axios.post(
        `/api/openings/${opening_id}/stages/${stage_id}/questions`,
        body
      );
      alert(data.message);
      setCreateQuestionModalOpen(false);
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh the question_order
    mutate(`/api/openings/${opening_id}/stages/${stage_id}`);

    // Refresh the question list
    mutate(
      `/api/orgs/${user.org_id}/openings/${opening_id}/stages/${stage_id}/questions`
    );
  };

  return (
    <>
      <CreateQuestionModal createQuestion={createQuestion} />
      {/* 3 column wrapper */}
      <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
        {/* Left sidebar & main wrapper */}
        <div className="flex-1 min-w-0 bg-white xl:flex">
          <div className="border-b border-gray-200 xl:border-b-0 xl:flex-shrink-0 xl:w-64 xl:border-r xl:border-gray-200 bg-white">
            <div className="h-full pl-4 pr-6 py-6 sm:pl-6 lg:pl-8 xl:pl-0">
              {/* Start left column area */}
              <div className="h-full relative" style={{ minHeight: "12rem" }}>
                <div className=" inset-0  border-gray-200 rounded-lg ">
                  <h1 className="text-center text-lg font-semibold mb-4">
                    Stage Order
                  </h1>

                  <DragDropContext
                    onDragEnd={handleDragEnd}
                    onDragStart={() => console.log("Start")}
                  >
                    <Droppable droppableId={opening.opening_id}>
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {new_stages?.map((stage, index) => {
                            return (
                              <Draggable
                                key={stage.stage_id}
                                draggableId={stage.stage_id}
                                index={index}
                                {...provided.droppableProps}
                              >
                                {(provided) => (
                                  <div
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    ref={provided.innerRef}
                                  >
                                    <Link
                                      href={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings/${opening_id}/stages/${stage.stage_id}/settings`}
                                    >
                                      <a>
                                        <DraggableStageCard
                                          opening_id={stage.opening_id}
                                          name={`${stage.GSI1SK}`}
                                          current_stage_id={stage.stage_id}
                                        />
                                      </a>
                                    </Link>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}

                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
              {/* End left column area */}
            </div>
          </div>

          <div className="bg-white lg:min-w-0 lg:flex-1">
            <div className="h-full py-6 px-4 sm:px-6 lg:px-8">
              {/* Start main area*/}
              <div className="relative h-full" style={{ minHeight: "36rem" }}>
                <div className=" inset-0  border-gray-200 rounded-lg">
                  <h1 className="text-center text-lg font-semibold mb-4">
                    {stage?.GSI1SK} Settings
                  </h1>
                </div>
                <span className="relative z-0 inline-flex shadow-sm rounded-md">
                  <button
                    type="button"
                    onClick={() => setCreateQuestionModalOpen(true)}
                    className="relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    Add a question
                  </button>
                  {/* <button
                    type="button"
                    className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    Add a rule
                  </button>
                  <button
                    type="button"
                    className="-ml-px relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    Add a
                  </button> */}
                </span>
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
