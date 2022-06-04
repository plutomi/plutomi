import { useRouter } from 'next/router';
import { mutate } from 'swr';
import { Draggable } from 'react-beautiful-dnd';
import { CustomQuery } from '../../types/main';
import { DynamoQuestion } from '../../types/dynamo';
import * as Questions from '../../adapters/Questions';
import * as Stages from '../../adapters/Stages';

interface DraggableQuestionItemProps {
  question: DynamoQuestion;
  index: number;
  provided: any; // TODO
}

export const DraggableQuestionItem = ({
  question,
  index,
  provided,
}: DraggableQuestionItemProps) => {
  const router = useRouter();

  const { openingId, stageId } = router.query as Pick<CustomQuery, 'openingId' | 'stageId'>;

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

    // Refresh the questionOrder and update the search results
    mutate(
      Stages.GetStageInfoURL({
        openingId,
        stageId,
      }),
    );

    // Refresh the questions in the stage
    mutate(
      Questions.GetQuestionsInStageURL({
        openingId,
        stageId,
      }),
    );
  };

  return (
    <Draggable
      key={question.questionId}
      draggableId={question.questionId}
      index={index}
      {...provided.droppableProps}
    >
      {(provided) => (
        <ol {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
          <li
            key={question.questionId}
            className="my-2 active:border-blue-500 hover:border-blue-500 flex border justify-between items-center bg-white  overflow-hidden p-4 sm:px-6 sm:rounded-md shadow-md hover:shadow-lg transition ease-in-out duration-300"
          >
            <div>
              {' '}
              <p>
                {index + 1}. {question.GSI1SK}
              </p>
              <p className="text-light text-sm">{question.description}</p>
            </div>

            <div className="flex items-center justify-center text-normal">
              <p>{question.questionId}</p>
              <button
                type="button"
                onClick={() => handleRemove(question)}
                className=" ml-4 px-2 py-1 right-0 border border-red-500 rounded-md text-red-500 bg-white hover:text-white hover:bg-red-500 transition ease-in duration-100"
              >
                Remove
              </button>
            </div>
          </li>
        </ol>
      )}
    </Draggable>
  );
};
