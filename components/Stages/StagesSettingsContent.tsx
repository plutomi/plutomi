import { useRouter } from 'next/router';
import StageReorderColumn from '../StageReorderColumn';
import useQuestionsInOrg from '../../SWR/useQuestionsInOrg';
import Loader from '../Loader';
import useSelf from '../../SWR/useSelf';
import useAllStagesInOpening from '../../SWR/useAllStagesInOpening';
import useOpeningInfo from '../../SWR/useOpeningInfo';
import useStageInfo from '../../SWR/useStageInfo';
import useQuestionsInStage from '../../SWR/useQuestionsInStage';
import { CUSTOM_QUERY } from '../../types/main';
import { useEffect, useState, Fragment, FormEvent } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { DynamoQuestion } from '../../types/dynamo';
import * as Questions from '../../adapters/Questions';
import { mutate } from 'swr';
import combineClassNames from '../../utils/combineClassNames';
import * as Stages from '../../adapters/Stages';

export default function StageSettingsContent() {
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState('');
  let { orgQuestions, isOrgQuestionsLoading, isOrgQuestionsError } = useQuestionsInOrg();
  const { openingId, stageId } = router.query as Pick<CUSTOM_QUERY, 'openingId' | 'stageId'>;
  const { stageQuestions, isStageQuestionsLoading, isStageQuestionsError } = useQuestionsInStage({
    openingId,
    stageId,
  });

  const [filteredOrgQuestions, setFilteredOrgQuestions] = useState(orgQuestions);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(null);

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

  const { user, isUserLoading, isUserError } = useSelf();
  let { opening, isOpeningLoading, isOpeningError } = useOpeningInfo(openingId);

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(opening?.openingId);
  const { stage, isStageLoading, isStageError } = useStageInfo(openingId, stageId);

  const handleShow = () => {
    // if (localSearch.toLowerCase().trim() === "") {
    //   setFilteredOrgQuestions(orgQuestions);
    //   setShow(true);
    //   return;
    // }
    setFilteredOrgQuestions(
      orgQuestions?.filter((question) =>
        question.GSI1SK.toLowerCase().trim().includes(localSearch.toLowerCase().trim()),
      ),
    );
    setShow(true);
  };
  const handleOnBlur = () => {
    // if (localSearch.toLowerCase().trim() === "") {
    //   setFilteredOrgQuestions(orgQuestions);
    //   setShow(false);
    //   return;
    // }
    setFilteredOrgQuestions(
      orgQuestions?.filter((question) =>
        question.GSI1SK.toLowerCase().trim().includes(localSearch.toLowerCase().trim()),
      ),
    );
    setShow(false);
  };

  useEffect(() => {
    setFilteredOrgQuestions(
      orgQuestions?.filter((question) =>
        question.GSI1SK.toLowerCase().trim().includes(localSearch.toLowerCase().trim()),
      ),
    );
  }, [localSearch]);

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

    console.log(result.source);
    console.log(result.destination);

    let newQuestionOrder: string[] = Array.from(stage?.questionOrder);
    newQuestionOrder.splice(source.index, 1);
    newQuestionOrder.splice(destination.index, 0, draggableId);
    let newOrder = newQuestionOrder.map((i) => stageQuestions.find((j) => j.questionId === i));

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
              <div className="relative h-full" style={{ minHeight: '36rem' }}>
                <div className=" inset-0  border-gray-200 rounded-lg">
                  <div className="flex flex-col justify-center items-center">
                    <input
                      type="text"
                      name="search"
                      id="search"
                      value={localSearch}
                      onClick={handleShow}
                      onBlur={handleOnBlur}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder={'Search for a question to add to this stage...'}
                      className="border-2 border-blue-300 mt-2 py-4 text-xl w-full shadow-sm focus:ring-blue-500 focus:border-blue-500    sm:text-sm  rounded-md"
                    />
                    <Listbox value={selected} onChange={(question) => handleAdd(question)}>
                      <>
                        <div className="mt-1 relative w-full">
                          <Transition
                            show={show}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            {/* TODO use datalist for this with a regular transition */}
                            <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                              {filteredOrgQuestions?.length === 0 ? (
                                <p className="disabled  text-gray-400 cursor-default select-none relative py-2 pl-3 pr-9 ">
                                  Question not found
                                </p>
                              ) : (
                                filteredOrgQuestions?.map((question: DynamoQuestion) => (
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
                                    <>
                                      <div className="flex items-center justify-between ">
                                        <p>
                                          {question.GSI1SK}
                                          {stage?.questionOrder.includes(question.questionId) &&
                                            ' - Already added'}
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
                                    </>
                                  </Listbox.Option>
                                ))
                              )}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </>
                    </Listbox>
                    <div className="w-full p-4 rounded-md">
                      {isStageQuestionsLoading && <h4>Loading questions...</h4>}
                      {isStageQuestionsError && (
                        <h4 className="text-red-500">
                          An error ocurred loading questions for this stage
                        </h4>
                      )}

                      {stage?.questionOrder.length > 0 ? (
                        <DragDropContext
                          onDragEnd={handleDragEnd}
                          onDragStart={() => console.log('Start')}
                        >
                          <Droppable droppableId={stage?.stageId}>
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef}>
                                {newQuestionOrder?.map((question, index) => {
                                  return (
                                    <Draggable
                                      key={question.questionId}
                                      draggableId={question.questionId}
                                      index={index}
                                      {...provided.droppableProps}
                                    >
                                      {(provided) => (
                                        <ol
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          ref={provided.innerRef}
                                        >
                                          <li
                                            key={question.questionId}
                                            className="my-2 active:border-blue-500 hover:border-blue-500 flex border justify-between items-center bg-white  overflow-hidden p-4 sm:px-6 sm:rounded-md shadow-md hover:shadow-lg transition ease-in-out duration-300"
                                          >
                                            <div>
                                              {' '}
                                              <p>
                                                {index + 1}. {question.GSI1SK}
                                              </p>
                                              <p className="text-light text-sm">
                                                {question.description}
                                              </p>
                                            </div>

                                            <div className="flex items-center justify-center text-normal">
                                              <p>{question.questionId}</p>
                                              <button
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
                                })}
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
