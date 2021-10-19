import useStore from "../utils/store";
import { PlusIcon } from "@heroicons/react/outline";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { mutate } from "swr";
import { useState } from "react";
import { useRouter } from "next/router";
import difference from "../utils/getObjectDifference";
import StageModal from "./Stages/StageModal";
import Link from "next/dist/client/link";
import { useSession } from "next-auth/client";
import axios from "axios";
import useUser from "../SWR/useUser";
import { useEffect } from "react";
import DraggableStageCard from "./Stages/DraggableStageCard";
import useOpeningById from "../SWR/useOpeningById";
import useAllStagesInOpening from "../SWR/useAllStagesInOpening";
import useStageById from "../SWR/useStageById";
export default function StageReorderColumn() {
  const createStage = async () => {
    const body: APICreateStageInput = {
      GSI1SK: stageModal.GSI1SK,
    };
    try {
      const { data } = await axios.post(
        `/api/openings/${opening_id}/stages`,
        body
      );
      alert(data.message);
      setStageModal({ ...stageModal, GSI1SK: "", is_modal_open: false });
    } catch (error) {
      console.error("Error creating stage", error);
      alert(error.response.data.message);
    }
    // Refresh stage order
    mutate(`/api/openings/${opening_id}`);

    // Refresh stage list
    mutate(`/api/openings/${opening_id}/stages`);
  };

  const updateStage = async () => {
    try {
      // Get the difference between the question returned from SWR
      // And the updated question in the modal
      const diff = difference(stage, stageModal);

      // Delete the two modal controlling keys
      delete diff["is_modal_open"];
      delete diff["modal_mode"];

      console.log(`Difference between the two objects`, diff);
      const body = {
        updated_stage: diff,
      };

      const { data } = await axios.put(
        `/api/openings/${opening_id}/stages/${stage_id}`,
        body
      );
      alert(data.message);
      setStageModal({
        is_modal_open: false,
        modal_mode: "CREATE",
        stage_id: "",
        GSI1SK: "",
      });
    } catch (error) {
      alert(error.response.data.message);
    }
    mutate(`/api/openings/${opening_id}/stages/${stage_id}`);
  };

  const router = useRouter();
  const { opening_id, stage_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id as string
  );

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    user?.user_id,
    opening?.opening_id
  );
  const { stage, isStageLoading, isStageError } = useStageById(
    user?.user_id,
    opening?.opening_id,
    stage_id as string
  );

  const [new_stages, setNewStages] = useState(stages);
  useEffect(() => {
    setNewStages(stages);
  }, [stages]);

  const stageModal = useStore((state: PlutomiState) => state.stageModal);
  const setStageModal = useStore((state: PlutomiState) => state.setStageModal);

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
      stages.find((j) => j.stage_id === i)
    );

    setNewStages(new_order);

    try {
      const body = {
        // TODO this should use the difference like the openingsettingscontent
        new_opening_values: { stage_order: new_stage_order },
      };

      await axios.put(`/api/openings/${opening_id}`, body);
    } catch (error) {
      console.error(error.response.data.message);
    }

    // Refresh the stage order
    mutate(`/api/openings/${opening_id}`);

    // Refresh the stages
    mutate(`/api/openings/${opening_id}/stages`);
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
          {opening?.stage_order.length == 0 ? "No stages found" : "Stage Order"}
        </h1>

        {opening?.stage_order.length > 0 && (
          <DragDropContext
            onDragEnd={handleDragEnd}
            onDragStart={() => console.log("Start")}
          >
            <Droppable droppableId={opening.opening_id}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {new_stages?.map((stage, index) => {
                    return (
                      <Draggable
                        key={stage.stage_id}
                        draggableId={stage.stage_id}
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
                              href={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings/${opening_id}/stages/${stage.stage_id}/settings`}
                            >
                              <a>
                                <DraggableStageCard
                                  opening_id={stage.opening_id}
                                  name={`${stage.GSI1SK}`}
                                  current_stage_id={stage.stage_id}
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
