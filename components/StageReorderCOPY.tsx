import useStore from "../utils/store";
import { PlusIcon } from "@heroicons/react/outline";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { mutate } from "swr";
import { useState } from "react";
import { useRouter } from "next/router";
import difference from "../utils/getObjectDifference";
import StageModal from "./Stages/StageModal";
import {
  CreateStage,
  UpdateStage,
  GetStageInfoURL,
  GetAllStagesInOpeningURL,
} from "../adapters/Stages";
import { useEffect } from "react";
import useOpeningInfo from "../SWR/useOpeningInfo";
import useAllStagesInOpening from "../SWR/useAllStagesInOpening";
import useStageInfo from "../SWR/useStageInfo";
import { UpdateOpening, GetOpeningInfoURL } from "../adapters/Openings";
import { CUSTOM_QUERY } from "../types/main";
import StageCard from "./Stages/StageCard";

export default function StageReorderColumn() {
  const createStage = async () => {
    try {
      const { message } = await CreateStage(stageModal.GSI1SK, openingId);
      alert(message);
      setStageModal({ ...stageModal, GSI1SK: "", isModalOpen: false });
    } catch (error) {
      console.error("Error creating stage", error);
      alert(error.response.data.message);
    }
    // Refresh stage order
    mutate(GetOpeningInfoURL(openingId));

    // Refresh stage list
    mutate(GetAllStagesInOpeningURL(openingId));
  };

  const updateStage = async () => {
    try {
      // Get the difference between the question returned from SWR
      // And the updated question in the modal
      //   const diff = difference(stage, stageModal);

      const diff = {};
      // Delete the two modal controlling keys
      delete diff["isModalOpen"];
      delete diff["modalMode"];

      const { message } = await UpdateStage(openingId, stageId, diff);
      alert(message);
      setStageModal({
        isModalOpen: false,
        modalMode: "CREATE",
        stageId: "",
        GSI1SK: "",
      });
    } catch (error) {
      alert(error.response.data.message);
    }

    mutate(GetStageInfoURL(openingId, stageId));
  };

  const router = useRouter();
  const { openingId, stageId } = router.query as Pick<
    CUSTOM_QUERY,
    "openingId" | "stageId"
  >;

  let { opening, isOpeningLoading, isOpeningError } = useOpeningInfo(openingId);

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    opening?.openingId
  );
  //   const { stage, isStageLoading, isStageError } = useStageInfo(
  //     openingId,
  //     stageId
  //   );

  //   const [newStages, setNewStages] = useState(stages);
  //   useEffect(() => {
  //     setNewStages(stages);
  //   }, [stages]);

  const stageModal = useStore((state) => state.stageModal);
  const setStageModal = useStore((state) => state.setStageModal);

  //   const handleDragEnd = async (result) => {
  //     console.log("Drag end result", result);
  //     const { destination, source, draggableId } = result;
  //     // No change
  //     if (!destination) {
  //       return;
  //     }
  //     // If dropped in the same place
  //     if (
  //       destination.droppableId === source.droppableId &&
  //       destination.index === source.index
  //     ) {
  //       return;
  //     }

  //     let newStageOrder = Array.from(opening.stageOrder);
  //     newStageOrder.splice(source.index, 1);
  //     newStageOrder.splice(destination.index, 0, draggableId);
  //     // let newOrder = newStageOrder.map((i) =>
  //     //   stages.find((j) => j.stageId === i)
  //     // );

  //     // setNewStages(newOrder);

  //     try {
  //       await UpdateOpening(openingId, {
  //         stageOrder: newStageOrder,
  //       });
  //     } catch (error) {
  //       console.error(error.response.data.message);
  //       alert(error.response.data.message);
  //     }

  //     // Refresh the stage order
  //     mutate(GetOpeningInfoURL(openingId));

  //     // Refresh the stages
  //     mutate(GetAllStagesInOpeningURL(openingId));
  //   };

  return <div>test</div>;
  // <div className="h-full relative" style={{ minHeight: "12rem" }}>
  //   <div className=" inset-0  border-gray-200 rounded-lg  ">
  /* <div className="flex flex-col justify-center items-center space-y-4 ">
          <button
            type="button"
            onClick={() =>
              setStageModal({
                ...stageModal,
                GSI1SK: "",
                modalMode: "CREATE",
                isModalOpen: true,
              })
            }
            className="inline-flex items-center px-4 py-2 border  shadow-sm text-base font-medium rounded-md border-blue-500 text-white bg-blue-500 hover:bg-blue-800 hover:text-white  transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-1  h-5 w-5" aria-hidden="true" />
            Add Stage
          </button>
        </div> */
}
{
  /* <h1 className="text-center text-xl font-semibold my-4">
          {opening?.totalStages === 0 ? "No stages found" : "Stage Order"}
        </h1> */
}
{
  /* 
        {opening?.totalStages > 0 && (
          <DragDropContext
            onDragEnd={handleDragEnd}
            onDragStart={() => console.log("Start")}
          >
            <Droppable droppableId={opening.openingId}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {newStages?.map((stage, index) => {
                    return (
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
                              draggable={true}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )} */
}
//   </div>
// </div>
