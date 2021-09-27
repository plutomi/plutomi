import CreateStageModal from "../../../../components/CreateStageModal";
import SignedInNav from "../../../../components/Navbar/SignedInNav";
import useAllStagesInOpening from "../../../../SWR/useAllStagesInOpening";
import useOpeningById from "../../../../SWR/useOpeningById";
import { GetRelativeTime } from "../../../../utils/time";
import SignIn from "../../../../components/SignIn";
import { useSession } from "next-auth/client";
import useStore from "../../../../utils/store";
import { mutate } from "swr";
import Link from "next/dist/client/link";
import StageCard from "./../../../../components/Pricing/StageCard";
import useUser from "../../../../SWR/useUser";
import { useRouter } from "next/router";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useState } from "react";
import { useEffect } from "react";
export default function ViewOpening() {
  const router = useRouter();
  const { opening_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  const setCreateStageModalOpen = useStore(
    (state: PlutomiState) => state.setCreateStageModalOpen
  );
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    session?.user_id,
    opening_id as string
  );

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    session?.user_id,
    opening_id as string
  );

  const [new_stages, setNewStages] = useState(stages);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setNewStages(stages);
  }, [stages]);

  const DeleteStage = async (stage_id: string) => {
    try {
      const { data } = await axios.delete(
        `/api/openings/${opening_id}/stages/${stage_id}`
      );
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }

    // Get all stages & get the new opening order
    mutate(`/api/openings/${opening_id}`);
    mutate(`/api/openings/${opening_id}/stages`);
  };

  const createStage = async (stage_name: string) => {
    const body: APICreateStageInput = {
      stage_name: stage_name,
    };
    try {
      const { data } = await axios.post(
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

    // Get all stages & get the new opening order
    mutate(`/api/openings/${opening_id}`);
    mutate(`/api/openings/${opening_id}/stages`);
  };

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

    setIsUpdating(true);

    let new_stage_order = Array.from(opening.stage_order);
    new_stage_order.splice(source.index, 1);
    new_stage_order.splice(destination.index, 0, draggableId);
    let new_order = new_stage_order.map((i) =>
      stages.find((j) => j.stage_id === i)
    );

    setNewStages(new_order);

    console.log(`New order`, new_order);
    console.log(`New StaGe order`, new_stage_order);

    try {
      const body = {
        updated_opening: { ...opening, stage_order: new_stage_order },
      };

      await axios.put(`/api/openings/${opening_id}`, body);
    } catch (error) {
      console.error(error.response.data.message);
    }

    mutate(`/api/openings/${opening_id}`); // Refresh the stage order
    setIsUpdating(false);
  };

  const UpdateOpening = async () => {
    const body: APIUpdateOpeningInput = {
      updated_opening: { ...opening, GSI1SK: "Beans" }, // TODO add custom name
    };
    try {
      const { data } = await axios.put(`/api/openings/${opening_id}`, body);
      console.log(data);
      alert(data.message);
    } catch (error) {
      console.log(error);
      alert(error.response.data.message);
    }

    mutate(`/api/openings/${opening_id}`); // Get new opening info
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
        <h1 className="text-xl font-bold text-normal">{opening?.GSI1SK}</h1>
        <p className="text-light text-lg">
          Created {GetRelativeTime(opening?.created_at)} -{" "}
          {opening?.is_public ? "Public" : "Private"}
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
            <h1>
              Stages will go here, when you click on one the applicants will
              come up. Change orientation to horizontal
            </h1>
            <div className="m-4 border rounded-md p-4">
              <h1 className="text-lg">Stage Order</h1>
              <p>Total stages: {opening.stage_order.length}</p>

              <ul className="p-4">
                {" "}
                {opening?.stage_order.map((id) => (
                  <li key={id}>
                    {opening.stage_order.indexOf(id) + 1}.{" "}
                    {new_stages
                      ? new_stages[opening?.stage_order.indexOf(id)]?.GSI1SK
                      : null}
                  </li>
                ))}
              </ul>
            </div>

            {/** STAGES START HERE */}
            {isUpdating ? (
              <h1 className="text-6xl font-bold m-8">Updating...</h1>
            ) : null}

            <DragDropContext
              onDragEnd={handleDragEnd}
              onDragStart={() => console.log("Start")}
            >
              <Droppable droppableId={opening.opening_id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4 flex flex-col  max-w-full mx-auto p-auto"
                  >
                    {new_stages?.length > 0 ? (
                      new_stages?.map((stage, index) => {
                        return (
                          <Draggable
                            key={stage.stage_id}
                            draggableId={stage.stage_id}
                            index={index}
                            {...provided.droppableProps}
                          >
                            {(provided) => (
                              <div
                                className="p-6 rounded-lg flex max-w-lg border justify-center items-center bg-white shadow-lg"
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                              >
                                <Link
                                  href={`/openings/${opening_id}/stages/${stage.stage_id}`}
                                >
                                  <a>
                                    <StageCard
                                      className="w-full border-0 hover:border-2 rounded-xl"
                                      stage_title={`${stage.GSI1SK} - ${stage.stage_id}`}
                                      num_applicants={10}
                                    />
                                  </a>
                                </Link>
                                <button
                                  onClick={(e) => DeleteStage(stage.stage_id)}
                                  className=" bg-red-500 hover:bg-red-800 px-5 py-3 text-white m-8 rounded-lg p-4"
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
