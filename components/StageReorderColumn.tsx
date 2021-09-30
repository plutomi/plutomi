import useStore from "../utils/store";
import { PlusIcon } from "@heroicons/react/outline";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { mutate } from "swr";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/dist/client/link";
import { useSession } from "next-auth/client";
import axios from "axios";
import useUser from "../SWR/useUser";
import { useEffect } from "react";
import DraggableStageCard from "./Stages/DraggableStageCard";
import useOpeningById from "../SWR/useOpeningById";
import useAllStagesInOpening from "../SWR/useAllStagesInOpening";
export default function StageReorderColumn() {
  const router = useRouter();
  const { opening_id, stage_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id as string
  );

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    session?.user_id,
    opening?.opening_id
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
        updated_opening: { ...opening, stage_order: new_stage_order },
      };

      await axios.put(`/api/openings/${opening_id}`, body);
    } catch (error) {
      console.error(error.response.data.message);
    }

    mutate(`/api/openings/${opening_id}`); // Refresh the stage order
  };

  return (
    <div className="h-full relative" style={{ minHeight: "12rem" }}>
      <div className=" inset-0  border-gray-200 rounded-lg  ">
        <div className="flex flex-col justify-center items-center space-y-2">
          <button
            type="button"
            onClick={() =>
              setStageModal({
                ...stageModal,
                GSI1SK: "",
                stage_mode: "CREATE",
                is_modal_open: true,
              })
            }
            className="inline-flex items-center px-4 py-2 border  shadow-sm text-base font-medium rounded-md border-blue-500 text-white bg-blue-500 hover:bg-blue-800 hover:text-white  transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-1  h-5 w-5" aria-hidden="true" />
            Add Stage
          </button>
          <h1 className="text-center text-lg font-semibold mb-4">
            {opening?.stage_order.length == 0
              ? "No stages found"
              : "Stage Order"}
          </h1>
        </div>

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
