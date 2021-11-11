import useStore from "../utils/store";
import { PlusIcon } from "@heroicons/react/outline";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { mutate } from "swr";
import { useState } from "react";
import { useRouter } from "next/router";
import difference from "../utils/getObjectDifference";
import StageModal from "./Stages/StageModal";
import Link from "next/dist/client/link";
import StagesService from "../adapters/StagesService";
import useSelf from "../SWR/useSelf";
import { useEffect } from "react";
import DraggableStageCard from "./Stages/DraggableStageCard";
import useOpeningById from "../SWR/useOpeningById";
import useAllStagesInOpening from "../SWR/useAllStagesInOpening";
import useStageById from "../SWR/useStageById";
import OpeningsService from "../adapters/OpeningsService";

export default function StageReorderColumn() {
  const createStage = async () => {
    try {
      const { message } = await StagesService.createStage({
        GSI1SK: stageModal.GSI1SK,
        openingId: openingId,
      });
      alert(message);
      setStageModal({ ...stageModal, GSI1SK: "", is_modal_open: false });
    } catch (error) {
      console.error("Error creating stage", error);
      alert(error.response.data.message);
    }
    // Refresh stage order
    mutate(OpeningsService.getOpeningURL({ openingId }));

    // Refresh stage list
    mutate(
      OpeningsService.getAllStagesInOpeningURL({
        openingId: openingId,
      })
    );
  };

  const updateStage = async () => {
    try {
      // Get the difference between the question returned from SWR
      // And the updated question in the modal
      const diff = difference(stage, stageModal);

      // Delete the two modal controlling keys
      delete diff["is_modal_open"];
      delete diff["modal_mode"];

      const { message } = await StagesService.updateStage({
        stageId: stageId,
        new_stage_values: diff,
      });
      alert(message);
      setStageModal({
        is_modal_open: false,
        modal_mode: "CREATE",
        stageId: "",
        GSI1SK: "",
      });
    } catch (error) {
      alert(error.response.data.message);
    }

    mutate(
      StagesService.getStageURL({
        stageId: stageId,
      })
    );
  };

  const router = useRouter();
  const { openingId, stageId } = router.query as CustomQuery;

  const { user, isUserLoading, isUserError } = useSelf();
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(openingId);

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    opening?.openingId
  );
  const { stage, isStageLoading, isStageError } = useStageById(stageId);

  const [new_stages, setNewStages] = useState(stages);
  useEffect(() => {
    setNewStages(stages);
  }, [stages]);

  const stageModal = useStore((state) => state.stageModal);
  const setStageModal = useStore((state) => state.setStageModal);

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

    let new_stage_order = Array.from(opening.stage_order);
    new_stage_order.splice(source.index, 1);
    new_stage_order.splice(destination.index, 0, draggableId);
    let new_order = new_stage_order.map((i) =>
      stages.find((j) => j.stageId === i)
    );

    setNewStages(new_order);

    try {
      await OpeningsService.updateOpening({
        openingId: openingId,
        new_opening_values: {
          stage_order: new_stage_order,
        },
      });
    } catch (error) {
      console.error(error.response.data.message);
      alert(error.response.data.message);
    }

    // Refresh the stage order
    mutate(OpeningsService.getOpeningURL({ openingId }));

    // Refresh the stages
    mutate(
      OpeningsService.getAllStagesInOpeningURL({
        openingId: openingId,
      })
    );
  };

  return (
    <div className="h-full relative" style={{ minHeight: "12rem" }}>
      <StageModal updateStage={updateStage} createStage={createStage} />

      <div className=" inset-0  border-gray-200 rounded-lg  ">
        <div className="flex flex-col justify-center items-center space-y-4 ">
          <button
            type="button"
            onClick={() =>
              setStageModal({
                ...stageModal,
                GSI1SK: "",
                modal_mode: "CREATE",
                is_modal_open: true,
              })
            }
            className="inline-flex items-center px-4 py-2 border  shadow-sm text-base font-medium rounded-md border-blue-500 text-white bg-blue-500 hover:bg-blue-800 hover:text-white  transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-1  h-5 w-5" aria-hidden="true" />
            Add Stage
          </button>
        </div>
        <h1 className="text-center text-xl font-semibold my-4">
          {opening?.total_stages == 0 ? "No stages found" : "Stage Order"}
        </h1>

        {opening?.total_stages > 0 && (
          <DragDropContext
            onDragEnd={handleDragEnd}
            onDragStart={() => console.log("Start")}
          >
            <Droppable droppableId={opening.openingId}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {new_stages?.map((stage, index) => {
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
                            <Link
                              href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/openings/${openingId}/stages/${stage.stageId}/settings`}
                            >
                              <a>
                                <DraggableStageCard
                                  total_applicants={stage.total_applicants}
                                  name={`${stage.GSI1SK}`}
                                  currentStageId={stage.stageId}
                                />
                              </a>
                            </Link>
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
        )}
      </div>
    </div>
  );
}
