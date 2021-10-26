import { useRouter } from "next/router";
import useSelf from "../../SWR/useSelf";
import useOpeningById from "../../SWR/useOpeningById";
import useStageById from "../../SWR/useStageById";
import axios from "axios";
import QuestionItem from "./QuestionItem";
import { useState } from "react";
import { mutate } from "swr";
import { useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import useAllStageQuestions from "../../SWR/useAllStageQuestions";
import Loader from "../Loader";
import StagesService from "../../adapters/StagesService";
import QuestionsService from "../../adapters/QuestionsService";
export default function QuestionList() {
  const router = useRouter();
  const { opening_id, stage_id } = router.query as CustomQuery;

  const { user, isUserLoading, isUserError } = useSelf();
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id
  );

  const { stage, isStageLoading, isStageError } = useStageById(stage_id);

  const { questions, isQuestionsLoading, isQuestionsError } =
    useAllStageQuestions(user?.org_id, stage?.stage_id);

  const [new_questions, setNewQuestions] = useState(questions);

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

    let new_question_order = Array.from(stage.question_order);
    new_question_order.splice(source.index, 1);
    new_question_order.splice(destination.index, 0, draggableId);
    let new_order = new_question_order.map((i) =>
      questions.find((j) => j.question_id === i)
    );

    setNewQuestions(new_order);

    try {
      await StagesService.updateStage({
        stage_id: stage_id,
        new_stage_values: {
          question_order: new_question_order,
        },
      });
    } catch (error) {
      alert(error.response.data.message);
      console.error(error.response.data.message);
    }

    mutate(
      StagesService.getStageURL({
        stage_id: stage_id,
      })
    );
  };

  const deleteQuestion = async (question_id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this question? This action cannot be reversed!"
      )
    ) {
      return;
    }

    try {
      const { message } = await QuestionsService.deleteQuestion({
        question_id,
      });
      alert(message);
    } catch (error) {
      alert(error.response.data);
    }

    // Refresh the stage (which returns the question order)
    mutate(
      StagesService.getStageURL({
        stage_id: stage_id,
      })
    );

    // Refresh questions
    mutate(StagesService.getAllQuestionsInStageURL({ stage_id }));
  };

  if (isQuestionsLoading) {
    return <Loader text={"Loading questions..."} />;
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
                        key={question?.question_id}
                        draggableId={question?.question_id}
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
