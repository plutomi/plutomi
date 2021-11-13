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
  const { openingId, stageId } = router.query as CustomQuery;

  const { user, isUserLoading, isUserError } = useSelf();
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(openingId);

  const { stage, isStageLoading, isStageError } = useStageById(stageId);

  const { questions, isQuestionsLoading, isQuestionsError } =
    useAllStageQuestions(user?.orgId, stage?.stageId);

  const [newQuestions, setNewQuestions] = useState(questions);

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

    let newQuestionOrder = Array.from(stage.questionOrder);
    newQuestionOrder.splice(source.index, 1);
    newQuestionOrder.splice(destination.index, 0, draggableId);
    let newOrder = newQuestionOrder.map((i) =>
      questions.find((j) => j.questionId === i)
    );

    setNewQuestions(newOrder);

    try {
      await StagesService.updateStage(stageId, {
        questionOrder: newQuestionOrder,
      });
    } catch (error) {
      alert(error.response.data.message);
      console.error(error.response.data.message);
    }

    mutate(StagesService.getStageURL(stageId));
  };

  const deleteQuestion = async (questionId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this question? This action cannot be reversed!"
      )
    ) {
      return;
    }

    try {
      const { message } = await QuestionsService.deleteQuestion(questionId);
      alert(message);
    } catch (error) {
      alert(error.response.data);
    }

    // Refresh the stage (which returns the question order)
    mutate(StagesService.getStageURL(stageId));

    // Refresh questions
    mutate(StagesService.getAllQuestionsInStageURL(stageId));
  };

  if (isQuestionsLoading) {
    return <Loader text={"Loading questions..."} />;
  }
  return (
    <div>
      <div className="flow-root mt-6">
        {/* Left Column Stage Order on /openings/-openingId-/settings */}
        <DragDropContext
          onDragEnd={handleDragEnd}
          onDragStart={() => console.log("Start")}
        >
          <Droppable droppableId={stage.stageId}>
            {(provided) => (
              <ul
                role="list"
                className="my-4 divide-y divide-gray-200"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {newQuestions?.map(
                  (question: DynamoStageQuestion, index: number) => {
                    return (
                      <Draggable
                        key={question?.questionId}
                        draggableId={question?.questionId}
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
                              newQuestions={newQuestions}
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
