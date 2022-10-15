import { PlusIcon } from '@heroicons/react/outline';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { mutate } from 'swr';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetStagesInOpeningURL, UpdateStage } from '../../adapters/Stages';
import useStore from '../../utils/store';
import { useOpeningInfo } from '../../SWR/useOpeningInfo';
import { useAllStagesInOpening } from '../../SWR/useAllStagesInOpening';
import { GetOpeningInfoURL } from '../../adapters/Openings';
import { CustomQuery } from '../../types/main';
import { CreateStageModal } from '../CreateStageModal';
import { StageCard } from '../StageCard';
import { getAdjacentStagesBasedOnPosition, sortStages } from '../../utils/sortStages';
import { Loader } from '../Loader';
import { DraggableStageCard } from '../DraggableStageCard';

export const StageReorderColumn = () => {
  const openCreateStageModal = useStore((state) => state.openCreateStageModal);

  const router = useRouter();
  const { openingId, stageId } = router.query as Pick<CustomQuery, 'openingId' | 'stageId'>;
  const { opening, isOpeningLoading, isOpeningError } = useOpeningInfo({ openingId });
  const { stages, isStagesLoading, isStagesError } = useAllStagesInOpening({
    openingId: opening.id,
  });
  const [newStages, setNewStages] = useState(stages);

  useEffect(() => {
    setNewStages(stages);
  }, [stages]);

  // TODO types!!!!!!!

  const handleOnDragEnd = async (result) => {
    const { draggableId, source, destination } = result;
    if (!destination) {
      console.log('user dropped outside of list');
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      console.log('User dropped in the same spot');
      return;
    }

    console.log(`RESULT`, result);
    let newStageOrder = [...newStages];

    // Remove our stage it from the old location
    newStageOrder.splice(source.index, 1); // TODO this isn't splicing!

    const ourStage = newStages.find((stage) => stage.id === draggableId);
    // Add it to the new location
    newStageOrder.splice(destination.index, 0, ourStage);
    setNewStages(newStageOrder);

    try {
      await UpdateStage({
        openingId,
        stageId: ourStage.id,
        newValues: {
          position: destination.index,
        },
      });
    } catch (error) {
      console.error(error.response.data.message);
      alert(error.response.data.message);
    }

    // Refresh the stages
    // mutate(GetStagesInOpeningURL(openingId)); // TODO: Don't think this is needed
  };

  if (isStagesLoading) {
    return <Loader text=">Loading stages..."></Loader>;
  }

  if (isStagesError) {
    return <h1>An error ocurred loading your stages</h1>;
  }

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
          {newStages && newStages.length ? 'Stage Order' : 'No stages found'}
        </h1>
        <div>
          {newStages && newStages.length ? (
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId={openingId}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className={'my-4'}>
                    {newStages?.map((stage, index) => (
                      <DraggableStageCard
                        key={stage.id}
                        stage={stage}
                        index={index}
                        linkHref={`/openings/${openingId}/stages/${stage.id}/settings`}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : null}
        </div>
      </div>
    </div>
  );
};
