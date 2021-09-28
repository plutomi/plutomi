import CreateStageModal from "../../../../components/CreateStageModal";
import SignedInNav from "../../../../components/Navbar/SignedInNav";
import useAllStagesInOpening from "../../../../SWR/useAllStagesInOpening";
import useOpeningById from "../../../../SWR/useOpeningById";
import { GetRelativeTime } from "../../../../utils/time";
import SignIn from "../../../../components/SignIn";
import { useSession } from "next-auth/client";
import Breadcrumbs from "../../../../components/Breadcrumbs";
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
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(false);
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

  const [newName, setNewName] = useState("");
  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    session?.user_id,
    opening_id as string
  );

  const [new_stages, setNewStages] = useState(stages);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setNewStages(stages);
  }, [stages]);

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

  const updateOpening = async (opening_id: string) => {
    try {
      const body = {
        updated_opening: {
          ...opening,
          GSI1SK: newName ? newName : opening.GSI1SK, // If not blank
          is_public: isPublic,
        },
      };

      const { data } = await axios.put(`/api/openings/${opening_id}`, body);
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
    mutate(`/api/openings/${opening_id}`);
    setIsEditing(false);
    setNewName("");
  };

  const deleteOpening = async (opening_id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this opening? THIS WILL ALSO DELETE ALL STAGES INSIDE OF IT!!!"
      )
    )
      return;

    try {
      const { status, data } = await axios.delete(
        `/api/openings/${opening_id}`
      );
      alert(data.message);
      router.push(`/openings`);
    } catch (error) {
      alert(error.response.data.message);
    }
    mutate(`/api/openings`);
  };

  const pages = [
    {
      name: "Openings",
      href: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings`,
      current: false,
    },
    {
      name: opening?.GSI1SK || "loading...",
      href: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings/${opening_id}/stages`,
      current: true,
    },
  ];

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

      <div className="px-20 ">
        <Breadcrumbs pages={pages} />
      </div>

      <div className="mx-auto max-w-4xl pt-20 flex flex-col justify-center items-center ">
        <h1 className="text-xl font-bold text-normal">{opening?.GSI1SK}</h1>
        <p className="text-light text-lg">
          Created {GetRelativeTime(opening?.created_at)} -{" "}
          {opening?.is_public ? "Public" : "Private"}
        </p>
        <div className="m-4  flex flex-wrap max-w-full">
          <button
            className="px-4 py-3 bg-red-500 m-4 text-white text-xl hover:bg-red-800"
            onClick={() => deleteOpening(opening.opening_id)}
          >
            Delete{" "}
          </button>
          <button
            className="px-4 py-3 bg-sky-500 m-4 text-white text-xl hover:bg-sky-800"
            onClick={() => setIsEditing(!isEditing)}
          >
            Edit{" "}
          </button>
        </div>
        {isEditing ? (
          <div className="max-w-xl my-2 mx-auto">
            <label
              htmlFor="newName"
              className="block text-sm font-medium text-gray-700"
            >
              Change name{" "}
              {!newName || newName === opening.GSI1SK ? (
                <span className="text-sm text-blue-gray-500">
                  - Name will stay the same
                </span>
              ) : null}
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="newName"
                id="newName"
                defaultValue={opening.GSI1SK}
                // value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="shadow-sm focus:ring-blue-gray-500 focus:border-blue-gray-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter your new name here"
              />
            </div>
            <div className="relative flex items-start my-4">
              <div className="flex items-center h-5">
                <input
                  id="comments"
                  aria-describedby="comments-description"
                  name="comments"
                  type="checkbox"
                  defaultChecked={opening.is_public}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="comments" className="font-medium text-gray-700">
                  Public
                </label>
                <p id="comments-description" className="text-gray-500">
                  Make this opening available for people to apply
                </p>
              </div>
            </div>
            <button
              onClick={() => updateOpening(opening.opening_id)}
              className=" px-4 py-3 text-white bg-green-500 rounded-lg"
            >
              Submit
            </button>
          </div>
        ) : null}
      </div>

      <button
        onClick={() => setCreateStageModalOpen(true)}
        className="mx-auto flex justify-center items-center px-4 py-2 bg-blue-700  rounded-lg text-white"
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
              <h1 className="text-6xl font-bold m-8 text-center">
                Updating...
              </h1>
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
                    className="space-y-4 flex rounded-md flex-col  mx-4 max-w-full border justify-center items-center"
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
                                className="m-2 w-full max-w-xl"
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                              >
                                <Link
                                  href={`/openings/${opening_id}/stages/${stage.stage_id}`}
                                >
                                  <a>
                                    <StageCard
                                      className="w-full border-0 hover:shadow-lg rounded-xl"
                                      stage_title={`${stage.GSI1SK} - ${stage.stage_id}`}
                                      num_applicants={10}
                                    />
                                  </a>
                                </Link>
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
