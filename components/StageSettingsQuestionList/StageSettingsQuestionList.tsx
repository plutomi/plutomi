import { useRouter } from 'next/router';
import { mutate } from 'swr';
import { useEffect, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useQuestionsInOrg } from '../../SWR/useQuestionsInOrg';
import { useStageInfo } from '../../SWR/useStageInfo';
import { useQuestionsInStage } from '../../SWR/useQuestionsInStage';
import { CustomQuery } from '../../types/main';
import { DynamoQuestion } from '../../types/dynamo';
import * as Questions from '../../adapters/Questions';
import combineClassNames from '../../utils/combineClassNames';
import * as Stages from '../../adapters/Stages';
import { DraggableQuestionItem } from '../DraggableQuestionItem';

export const StageSettingsQuestionList = () => {
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState('');
  const { orgQuestions, isOrgQuestionsLoading, isOrgQuestionsError } = useQuestionsInOrg();
  const { openingId, stageId } = router.query as Pick<CustomQuery, 'openingId' | 'stageId'>;

  const { stageQuestions, isStageQuestionsLoading, isStageQuestionsError } = useQuestionsInStage({
    openingId,
    stageId,
  });

  const { stage, isStageLoading, isStageError } = useStageInfo({ openingId, stageId });
  const [filteredOrgQuestions, setFilteredOrgQuestions] = useState(orgQuestions);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(undefined);

  const handleSearch = async (value: string) => {
    setLocalSearch(value);
  };

  const handleAdd = async (question: DynamoQuestion) => {
    // TODO check if already exists in stage in FE, we check for this in the backend

    // If doesnt exist, add it.
    try {
      const { data } = await Questions.AddQuestionToStage({
        openingId,
        stageId,
        questionId: question.questionId,
      });

      alert(data.message);
      setLocalSearch('');
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

  useEffect(() => {
    setFilteredOrgQuestions(
      orgQuestions?.filter((question) =>
        question.GSI1SK.toLowerCase().trim().includes(localSearch.toLowerCase().trim()),
      ),
    );
  }, [localSearch, orgQuestions]);

  const [newQuestionOrder, setNewQuestionOrder] = useState(stageQuestions);
  useEffect(() => {
    setNewQuestionOrder(stageQuestions);
  }, [stageQuestions]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    // No change
    if (!destination) {
      console.log('Not moved');
      return;
    }
    // If dropped in the same place
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      console.log('Dropped in same place');

      return;
    }

    const newQuestionOrder: string[] = Array.from(stage?.questionOrder);
    newQuestionOrder.splice(source.index, 1);
    newQuestionOrder.splice(destination.index, 0, draggableId);
    const newOrder = newQuestionOrder.map((i) => stageQuestions.find((j) => j.questionId === i));

    setNewQuestionOrder(newOrder);

    try {
      await Stages.UpdateStage({
        openingId,
        stageId,
        newValues: {
          questionOrder: newQuestionOrder,
        },
      });
    } catch (error) {
      console.error(error.response.data.message);
      alert(error.response.data.message);
    }

    // Refresh stage info (stage order)
    mutate(
      Stages.GetStageInfoURL({
        openingId,
        stageId,
      }),
    );

    // Refresh the questions
    mutate(
      Questions.GetQuestionsInStageURL({
        openingId,
        stageId,
      }),
    );
  };

  const handleShow = () => {
    setFilteredOrgQuestions(
      orgQuestions?.filter((question) =>
        question.GSI1SK.toLowerCase().trim().includes(localSearch.toLowerCase().trim()),
      ),
    );
    setShow(true);
  };
  const handleOnBlur = () => {
    setFilteredOrgQuestions(
      orgQuestions?.filter((question) =>
        question.GSI1SK.toLowerCase().trim().includes(localSearch.toLowerCase().trim()),
      ),
    );
    setShow(false);
  };

  const listBoxOptions = (): React.ReactElement => {
    if (!orgQuestions?.length) {
      return (
        <p className="disabled  text-gray-400 cursor-default select-none relative py-2 pl-3 pr-9 ">
          No questions found
        </p>
      );
    }

    if (!filteredOrgQuestions?.length && orgQuestions?.length > 0) {
      return (
        <p className="disabled  text-gray-400 cursor-default select-none relative py-2 pl-3 pr-9 ">
          Question not found
        </p>
      );
    }

    filteredOrgQuestions?.map((question) => (
      <Listbox.Option
        key={question.questionId}
        disabled={stage?.questionOrder.includes(question.questionId)}
        className={combineClassNames(
          stage?.questionOrder.includes(question.questionId)
            ? 'disabled text-disabled'
            : 'hover:bg-blue-500 hover:text-white hover:cursor-pointer',
          'cursor-default select-none relative py-2 pl-3 pr-9 group',
        )}
        value={question}
      >
        <div className="flex items-center justify-between ">
          <p>
            {question.GSI1SK}
            {stage?.questionOrder.includes(question.questionId) && ' - Already added'}
          </p>
          <p
            className={combineClassNames(
              stage?.questionOrder.includes(question.questionId)
                ? 'disabled text-disabled'
                : 'text-normal group-hover:text-white',
            )}
          >
            {question.questionId}
          </p>
        </div>
      </Listbox.Option>
    ));
  };

  return (
    <div className="flex flex-col justify-center items-center p-2">
      <input
        type="text"
        name="search"
        id="search"
        value={localSearch}
        onClick={handleShow}
        onBlur={handleOnBlur}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search for a question to add to this stage..."
        className="border-2 border-blue-300 mt-2 py-3 text-xl w-full shadow-sm focus:ring-blue-500 focus:border-blue-500    sm:text-sm  rounded-md"
      />
      <Listbox value={selected} onChange={(question) => handleAdd(question)}>
        <div className="mt-1 relative w-full">
          <Transition
            show={show}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {/* TODO use datalist for this with a regular transition */}
            <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {listBoxOptions}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      <div className="w-full p-4 rounded-md">
        {isStageQuestionsLoading && <h4>Loading questions...</h4>}
        {isStageQuestionsError && (
          <h4 className="text-red-500">An error ocurred loading questions for this stage</h4>
        )}

        {stage?.questionOrder.length > 0 ? (
          <DragDropContext onDragEnd={handleDragEnd} onDragStart={() => console.log('Start')}>
            <Droppable droppableId={stage?.stageId}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {newQuestionOrder?.map((question, index) => (
                    <DraggableQuestionItem
                      key={question.questionId}
                      question={question}
                      index={index}
                      provided={provided}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          stageQuestions && <h4>No questions found</h4>
        )}
      </div>
    </div>
  );
};
