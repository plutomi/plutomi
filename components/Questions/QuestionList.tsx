import { useRouter } from "next/router";
import { useSession } from "next-auth/client";
import useUser from "../../SWR/useUser";
import useAllStagesInOpening from "../../SWR/useAllStagesInOpening";
import useOpeningById from "../../SWR/useOpeningById";
import useStageById from "../../SWR/useStageById";
import axios from "axios";
import { useState } from "react";
import { mutate } from "swr";
import { useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import useAllStageQuestions from "../../SWR/useAllStageQuestions";
import Loader from "../Loader";
export default function QuestionList() {
  const router = useRouter();
  const { opening_id, stage_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id as string
  );

  const { stage, isStageLoading, isStageError } = useStageById(
    user?.user_id,
    opening?.opening_id,
    stage_id as string
  );

  const { questions, isQuestionsLoading, isQuestionsError } =
    useAllStageQuestions(user?.org_id, opening?.opening_id, stage?.stage_id);

  const [new_questions, setNewQuestions] = useState(questions);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setNewQuestions(questions);
  }, [questions]);

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

    setIsUpdating(true);

    let new_question_order = Array.from(stage.question_order);
    new_question_order.splice(source.index, 1);
    new_question_order.splice(destination.index, 0, draggableId);
    let new_order = new_question_order.map((i) =>
      questions.find((j) => j.question_id === i)
    );

    setNewQuestions(new_order);

    try {
      const body = {
        updated_stage: { ...stage, question_order: new_question_order },
      };

      await axios.put(`/api/openings/${opening_id}/stages/${stage_id}`, body);
    } catch (error) {
      alert(error.response.data.message);
      console.error(error.response.data.message);
    }

    mutate(`/api/openings/${opening_id}/stages/${stage_id}`); // Refresh the question order
    setIsUpdating(false);
  };

  if (isQuestionsLoading) {
    return <Loader text={"Loading questions..."} />;
  }
  return (
    <div>
      <div className="flow-root mt-6">
        <ul role="list" className="-my-5 divide-y divide-gray-200">
          {/* BELOW THIS LINE */}

          {questions?.map((question: DynamoStageQuestion) => (
            <li key={question.question_id} className="py-5">
              <div className="relative focus-within:ring-2 focus-within:ring-blue-500">
                <h3 className="text-sm font-semibold text-gray-800">
                  {/* <a href="#" className="hover:underline focus:outline-none"> */}
                  {/* Extend touch target to entire panel */}
                  <span className="absolute inset-0" aria-hidden="true" />
                  {question.GSI1SK}
                  {/* </a> */}
                </h3>
                {question.question_description ? (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {question.question_description}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
          {/* ABOVE THIS LINE */}

          {/* Left Column Stage Order on /openings/-opening_id-/settings */}

          <DragDropContext
            onDragEnd={handleDragEnd}
            onDragStart={() => console.log("Start")}
          >
            <Droppable droppableId={stage.stage_id}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-12 flex rounded-md flex-col  mx-4 max-w-full border justify-center items-center"
                >
                  {new_questions?.map(
                    (question: DynamoStageQuestion, index: number) => {
                      return (
                        <Draggable
                          className="m-6 p-4 w-full max-w-xl bg-white"
                          key={question.question_id}
                          draggableId={question.question_id}
                          index={index}
                          {...provided.droppableProps}
                        >
                          {(provided) => (
                            <div
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                            >
                              <div
                                key={question.question_id}
                                className="p-4 border rounded-md shadow-md max-w-xl bg-white"
                              >
                                <h1 className="font-bold text-lg">
                                  {question.GSI1SK} - {question.question_id}
                                </h1>
                                <p className="text-sm text-blue-gray-500">
                                  {question.question_description}
                                </p>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    }
                  )}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ul>
      </div>
    </div>
  );
}
