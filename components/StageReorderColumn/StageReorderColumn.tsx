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

export const StageReorderColumn = () => {
  const openCreateStageModal = useStore((state) => state.openCreateStageModal);

  const router = useRouter();
  const { openingId, stageId } = router.query as Pick<CustomQuery, 'openingId' | 'stageId'>;
  const { opening, isOpeningLoading, isOpeningError } = useOpeningInfo({ openingId });
  const { stages, isStagesLoading, isStagesError } = useAllStagesInOpening({
    openingId: opening.id,
  });

  const [newStages, setNewStages] = useState(stages);
  // useEffect(() => {
  //   if (stages) {
  //     const sortedStages = sortStages(stages);
  //     setNewStages(sortedStages);
  //   }
  // }, [stages]);

  // TODO types!!!!!!!
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    // No change
    if (!destination) {
      return;
    }
    // If dropped in the same place
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      console.log('Dropped in the same place');
      return;
    }

    console.log(`Current stages`, stages);

    // alert('STAGE REORDER ORDER HERE'); // These are for the local stages in teh draggable
    const newStageOrder: string[] = Array.from(stages.map((stage) => stage.id));

    console.log(`New stage order ids`, newStageOrder);

    // Logging new order names for clarify
    newStageOrder.map((id) => {
      const stage = stages.find((stage) => stage.id === id);
      console.log(stage.name);
    });

    newStageOrder.splice(source.index, 1);
    newStageOrder.splice(destination.index, 0, draggableId);
    const newOrder = newStageOrder.map((i) => stages.find((j) => j.id === i));

    // TODO remove duplicates from this!!!!!!!
    setNewStages(newOrder);

    try {
      await UpdateStage({
        openingId,
        stageId: draggableId,
        newValues: {
          position: destination.index,
        },
      });
    } catch (error) {
      console.error(error.response.data.message);
      alert(error.response.data.message);
    }

    // Refresh the stage order
    mutate(GetOpeningInfoURL(openingId));

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
          {opening?.totalStages === 0 ? 'No stages found' : 'Stage Order'}
        </h1>

        {!stages.length ? <h1>No stages found!</h1> : null}
        {stages.map((stage) => (
          <div className="p-8 my-2 border-4 rounded-lg">
            <h1>{stage.name}</h1>
          </div>
        ))}
      </div>
    </div>
  );
};
