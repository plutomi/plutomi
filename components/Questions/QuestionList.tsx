import { useRouter } from "next/router";
import { useSession } from "next-auth/client";
import useUser from "../../SWR/useUser";
import useAllStagesInOpening from "../../SWR/useAllStagesInOpening";
import useOpeningById from "../../SWR/useOpeningById";
import useStageById from "../../SWR/useStageById";
import axios from "axios";
import QuestionItem from "./QuestionItem";
import { PencilAltIcon, TrashIcon } from "@heroicons/react/outline";
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

  const deleteQuestion = async (stage_question_id) => {
    try {
      console.log("In delete question", stage_question_id);
      const { data } = await axios.delete(
        `/api/openings/${opening_id}/stages/${stage_id}/questions/${stage_question_id}`
      );
      alert(data.message);
    } catch (error) {
      alert(error.response.data);
    }

    // Refresh question order
    mutate(`/api/openings/${opening_id}/stages/${stage_id}`);

    // Refresh questions
    mutate(
      `/api/orgs/${user?.org_id}/openings/${opening_id}/stages/${stage_id}/questions`
    );
  };

  if (isQuestionsLoading) {
    return <Loader text={"Loading stage..."} />;
  }
  return (
    <div>
      <div className="flow-root mt-6">
        {/* Left Column Stage Order on /openings/-opening_id-/settings */}

        <DragDropContext
          onDragEnd={handleDragEnd}
          onDragStart={() => console.log("Start")}
        >
          <Droppable droppableId={stage.stage_id}>
            {(provided) => (
              <ul
                role="list"
                className="my-4 divide-y divide-gray-200"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {new_questions?.map(
                  (question: DynamoStageQuestion, index: number) => {
                    return (
                      <Draggable
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
                            <QuestionItem
                              question={question}
                              new_questions={new_questions}
                              deleteQuestion={deleteQuestion}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  }
                )}

                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
