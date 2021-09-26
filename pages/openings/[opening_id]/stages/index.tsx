import CreateStageModal from "../../../../components/CreateStageModal";
import SignedInNav from "../../../../components/Navbar/SignedInNav";
import useAllStagesInOpening from "../../../../SWR/useAllStagesInOpening";
import useOpeningById from "../../../../SWR/useOpeningById";
import { GetRelativeTime } from "../../../../utils/time";
import SignIn from "../../../../components/SignIn";
import { useSession } from "next-auth/client";
import useStore from "../../../../utils/store";
import { mutate } from "swr";
import useUser from "../../../../SWR/useUser";
import Link from "next/dist/client/link";
import { useRouter } from "next/router";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { FormEvent } from "react";
import { create } from "lodash";
export default function ViewOpening() {
  const router = useRouter();
  const { opening_id } = router.query;
  console.log("ROUTER", router);
  console.log("Opening ID");
  console.log(opening_id);
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  const setCreateStageModalOpen = useStore(
    (state: PlutomiState) => state.setCreateStageModalOpen
  );
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    session?.user_id,
    opening_id as string
  );

  console.log("Opening component id", opening_id);
  const { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    session?.user_id,
    opening_id as string
  );

  const DeleteStage = async (stage_id: string) => {
    try {
      await axios.delete(`/api/openings/${opening_id}/stages/${stage_id}`);
      alert("SSStage deleted");
    } catch (error) {
      alert(`Error deleting stage ${error.response.data.message}`);
    }
    mutate(`/api/openings/${opening_id}`); // Refresh the stage order
    mutate(`/api/openings/${opening_id}/stages`); // Refresh the actual stages
  };

  const createStage = async (stage_name: string) => {
    const body: APICreateStageInput = {
      stage_name: stage_name,
    };
    try {
      const { status, data } = await axios.post(
        `/api/openings/${opening_id}/stages`,
        body
      );
      console.log("In modal", data.message, opening_id);
      alert(data.message);
      // TODO calling mutate here  breaks, we do not call mutate in the other modals
      setCreateStageModalOpen(false);
    } catch (error) {
      console.error("Error creating stage", error);
      alert(error.response.data.message);
    }
    // TODO add mutate for getting opening here as well
    // Refresh all stages &
    // Refresh opening (stage order)
    mutate(`/api/openings/${opening_id}`);
    mutate(`/api/openings/${opening_id}/stages`);
  };

  const handleDragEnd = () => {
    // TODO update drag
    alert("Moved stage");
  };
  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) {
    return null;
  }

  // If no session or bad userid
  if (!session || isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings`}
        desiredPage={"your openings"}
      />
    );
  }

  if (isUserLoading) {
    return (
      <div className="mx-auto p-20 flex justify-center items-center">
        <h1 className="text-4xl text-dark font-medium">Loading...</h1>
      </div>
    );
  }

  return (
    <div>
      <SignedInNav user={user} current={"Openings"} />
      <div className="mx-auto max-w-md p-20 ">
        <h1 className="text-xl font-bold text-normal">
          {opening?.opening_name}
        </h1>
        <p className="text-light text-lg">
          Created {GetRelativeTime(opening?.created_at)}
        </p>
      </div>
      <button
        onClick={() => setCreateStageModalOpen(true)}
        className="mx-auto flex justify-center items-center px-4 py-2 bg-blue-700 m-2 rounded-lg text-white"
      >
        + Add stage
      </button>
      <CreateStageModal createStage={createStage} />
      {opening ? (
        <div>
          <div className="mx-auto max-w-7xl p-20">
            <h1>Stages will go here</h1>
            <div className="m-4 border rounded-md p-4">
              <h1 className="text-lg">Stage Order</h1>
              <p>Total stages: {opening.stage_order.length}</p>

              <ul className="p-4">
                {" "}
                {opening.stage_order.map((id) => (
                  <li key={id}>
                    {opening.stage_order.indexOf(id) + 1}. {id}
                  </li>
                ))}
              </ul>
            </div>

            {/** STAGES START HERE */}
            <DragDropContext
              onDragEnd={handleDragEnd}
              onDragStart={() => console.log("Start")}
            >
              <Droppable droppableId={opening.opening_id}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {stages?.length > 0 ? (
                      stages.map((stage, index) => {
                        return (
                          <Draggable
                            key={stage.stage_id}
                            draggableId={stage.stage_id}
                            index={index}
                            {...provided.droppableProps}
                          >
                            {(provided) => (
                              <div
                                className="flex justify-center items-center"
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                              >
                                <div className="border w-2/3 my-4 p-4 hover:bg-blue-gray-100 rounded-lg border-blue-gray-400">
                                  <a
                                    href={`/openings/${opening_id}/stages/${stage.stage_id}`}
                                  >
                                    <a>
                                      <h1 className="font-bold text-xl text-normal my-2">
                                        {stage.stage_name}
                                      </h1>
                                      <p className="text-lg text-normal">
                                        ID: {stage.stage_id}
                                      </p>
                                      <p className="text-normal text-lg ">
                                        Created{" "}
                                        {GetRelativeTime(stage.created_at)}
                                      </p>
                                    </a>
                                  </a>
                                </div>
                                <button
                                  onClick={(e) => DeleteStage(stage.stage_id)}
                                  className="bg-red-500 px-5 py-3 text-white m-8 rounded-lg p-4"
                                >
                                  Delete Stage
                                </button>
                              </div>
                            )}
                          </Draggable>
                        );
                      })
                    ) : isStagesLoading ? (
                      <h1>Loading...</h1>
                    ) : (
                      <h1>No stages found</h1>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      ) : (
        <h1>No opening found by that ID</h1>
      )}
    </div>
  );
}
