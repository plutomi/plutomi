import OpeningList from "./OpeningsList";
import { useSession } from "next-auth/client";
import useOpenings from "../../SWR/useOpenings";
import { useRouter } from "next/router";
import { mutate } from "swr";
import difference from "../../utils/getObjectDifference";
import Link from "next/dist/client/link";
import StageCard from "../Stages/StageCard";
import { useEffect } from "react";
import OpeningModal from "./OpeningModal";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableStageCard from "../../components/Stages/DraggableStageCard";
import Loader from "../Loader";
import useUser from "../../SWR/useUser";
import { useState } from "react";
import useStore from "../../utils/store";
import useAllStagesInOpening from "../../SWR/useAllStagesInOpening";
import useOpeningById from "../../SWR/useOpeningById";
export default function OpeningSettingsContent() {
  const router = useRouter();
  const { opening_id } = router.query;
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

  const openingModal = useStore((state: PlutomiState) => state.openingModal);
  const setOpeningModal = useStore(
    (state: PlutomiState) => state.setOpeningModal
  );
  const [new_stages, setNewStages] = useState(stages);
  const [isStageOrderUpdating, setIsStageOrderUpdating] = useState(false);
  const [isQuestionOrderUpdating, setIsQuestionOrderUpdating] = useState(false);
  useEffect(() => {
    setNewStages(stages);
  }, [stages]);

  if (isOpeningLoading) {
    return <Loader text="Loading opening..." />;
  }

  if (isStagesLoading) {
    return <Loader text="Loading stages..." />;
  }

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

    setIsStageOrderUpdating(true);

    let new_stage_order = Array.from(opening.stage_order);
    new_stage_order.splice(source.index, 1);
    new_stage_order.splice(destination.index, 0, draggableId);
    let new_order = new_stage_order.map((i) =>
      stages.find((j) => j.stage_id === i)
    );

    setNewStages(new_order);

    try {
      const body = {
        updated_opening: { stage_order: new_stage_order },
      };

      await axios.put(`/api/openings/${opening_id}`, body);
    } catch (error) {
      alert(error.response.data.message);
      console.error(error.response.data.message);
    }

    mutate(`/api/openings/${opening_id}`); // Refresh the stage order
    setIsStageOrderUpdating(false);
  };

  const updateOpening = async () => {
    try {
      // Get the difference between the opening returned from SWR
      // And the opening modal inputs / edits
      const diff = difference(opening, openingModal);

      // Delete the two modal controlling keys
      delete diff["is_modal_open"];
      delete diff["modal_mode"];
      const body = {
        updated_opening: diff,
      };

      console.log("Outgoing body", body);

      const { data } = await axios.put(
        `/api/openings/${openingModal.opening_id}`,
        body
      );
      alert(data.message);
      setOpeningModal({
        is_modal_open: false,
        modal_mode: "CREATE",
        is_public: false,
        opening_id: "",
        GSI1SK: "",
      });
    } catch (error) {
      alert(error.response.data.message);
    }
    // Refresh opening data
    mutate(`/api/openings/${openingModal.opening_id}`);
  };

  return (
    <>
      {/* 3 column wrapper */}
      <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
        {/* Left sidebar & main wrapper */}
        <OpeningModal updateOpening={updateOpening} />
        <div className="flex-1 min-w-0 bg-white xl:flex">
          <div className="border-b border-gray-200 xl:border-b-0 xl:flex-shrink-0 xl:w-64 xl:border-r xl:border-gray-200 bg-white">
            <div className="h-full pl-4 pr-6 py-6 sm:pl-6 lg:pl-8 xl:pl-0">
              {/* Start left column area */}
              <div className="h-full relative" style={{ minHeight: "12rem" }}>
                <div className=" inset-0  border-gray-200 rounded-lg ">
                  <h1 className="text-center text-lg font-semibold mb-4">
                    {opening?.stage_order.length == 0
                      ? "No stages found"
                      : "Stage Order"}
                  </h1>

                  {/* Add button here to create a stage, opens modal */}
                  {/* Left Column Stage Order on /openings/-opening_id-/settings */}

                  {opening?.stage_order.length > 0 && (
                    <DragDropContext
                      onDragEnd={handleDragEnd}
                      onDragStart={() => console.log("Start")}
                    >
                      <Droppable droppableId={opening.opening_id}>
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
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
              {/* End left column area */}
            </div>
          </div>

          <div className="bg-white lg:min-w-0 lg:flex-1">
            <div className="h-full py-6 px-4 sm:px-6 lg:px-8">
              {/* Start main area*/}
              <div className="relative h-full" style={{ minHeight: "36rem" }}>
                <div className=" inset-0  border-gray-200 rounded-lg">
                  <h1 className="text-center text-lg font-semibold mb-4">
                    {opening?.GSI1SK} Settings
                  </h1>
                </div>

                <span className="relative z-0 inline-flex shadow-sm rounded-md">
                  <button
                    type="button"
                    onClick={() =>
                      setOpeningModal({
                        is_modal_open: true,
                        modal_mode: "EDIT",
                        opening_id: opening.opening_id,
                        GSI1SK: opening.GSI1SK,
                        is_public: opening.is_public,
                      })
                    }
                    className="relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    Edit Opening
                  </button>
                </span>
              </div>
              {/* End main area */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
