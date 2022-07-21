import { PlusIcon } from '@heroicons/react/outline';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { mutate } from 'swr';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetStagesInOpeningURL } from '../../adapters/Stages';
import useStore from '../../utils/store';
import { useOpeningInfo } from '../../SWR/useOpeningInfo';
import { useAllStagesInOpening } from '../../SWR/useAllStagesInOpening';
import { UpdateOpening, GetOpeningInfoURL } from '../../adapters/Openings';
import { CustomQuery } from '../../types/main';
import { CreateStageModal } from '../CreateStageModal';
import { StageCard } from '../StageCard';

export const StageReorderColumn = () => {
  const openCreateStageModal = useStore((state) => state.openCreateStageModal);

  const router = useRouter();
  const { openingId, stageId } = router.query as Pick<CustomQuery, 'openingId' | 'stageId'>;
  const { opening, isOpeningLoading, isOpeningError } = useOpeningInfo({ openingId });
  const { stages, isStagesLoading, isStagesError } = useAllStagesInOpening({
    openingId,
  });

  const [newStages, setNewStages] = useState(stages);
  useEffect(() => {
    setNewStages(stages);
  }, [stages]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    // No change
    if (!destination) {
      return;
    }
    // If dropped in the same place
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStageOrder: string[] = Array.from(opening.stageOrder);
    newStageOrder.splice(source.index, 1);
    newStageOrder.splice(destination.index, 0, draggableId);
    const newOrder = newStageOrder.map((i) => stages.find((j) => j.stageId === i));

    setNewStages(newOrder);

    try {
      await UpdateOpening({
        openingId,
        newValues: {
          stageOrder: newStageOrder,
        },
      });
    } catch (error) {
      console.error(error.response.data.message);
      alert(error.response.data.message);
    }

    // Refresh the stage order
    mutate(GetOpeningInfoURL(openingId));

    // Refresh the stages
    mutate(GetStagesInOpeningURL(openingId));
  };

  return (
    <div className="h-full relative" style={{ minHeight: '12rem' }}>
      <CreateStageModal />
      <div className=" inset-0  border-gray-200 rounded-lg  ">
        <div className="flex flex-col justify-center items-center space-y-4 ">
          <button
            type="button"
            onClick={openCreateStageModal}
            className="inline-flex items-center px-4 py-2 border  shadow-sm text-base font-medium rounded-md border-blue-500 text-white bg-blue-500 hover:bg-blue-800 hover:text-white  transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-1  h-5 w-5" aria-hidden="true" />
            Add Stage
          </button>
        </div>
        <h1 className="text-center text-xl font-semibold my-4">
          {opening?.totalStages === 0 ? 'No stages found' : 'Stage Order'}
        </h1>

        {opening?.totalStages > 0 && (
          <DragDropContext onDragEnd={handleDragEnd} onDragStart={() => console.log('Start')}>
            <Droppable droppableId={opening.openingId}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {newStages?.map((stage, index) => (
                    <Draggable
                      key={stage.stageId}
                      draggableId={stage.stageId}
                      index={index}
                      {...provided.droppableProps}
                    >
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                        >
                          <StageCard
                            key={stage.stageId}
                            totalApplicants={stage.totalApplicants}
                            name={`${stage.GSI1SK}`}
                            stageId={stage.stageId}
                            linkHref={`/openings/${openingId}/stages/${stage.stageId}/settings`}
                            draggable
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
};
