import CreateStageModal from "../../../../components/Stages/CreateStageModal";
import SignedInNav from "../../../../components/Navbar/SignedInNav";
import useAllStagesInOpening from "../../../../SWR/useAllStagesInOpening";
import useOpeningById from "../../../../SWR/useOpeningById";
import { GetRelativeTime } from "../../../../utils/time";
import SignIn from "../../../../components/SignIn";
import { useSession } from "next-auth/client";
import GoBack from "../../../../components/Buttons/GoBackButton";
import useStore from "../../../../utils/store";
import { mutate } from "swr";
import Link from "next/dist/client/link";
import StageCard from "../../../../components/Pricing/StageCard";
import useUser from "../../../../SWR/useUser";
import { useRouter } from "next/router";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useState } from "react";
import { useEffect } from "react";

export default function ViewOpening() {
  const [isEditing, setIsEditing] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [session, loading]: [CustomSession, boolean] = useSession();

  const router = useRouter();
  const { opening_id } = router.query;

  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    session?.user_id,
    opening_id as string
  );

  const [newName, setNewName] = useState("");
  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    session?.user_id,
    opening_id as string
  );

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

    // Refresh opening data
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
      const { data } = await axios.delete(`/api/openings/${opening_id}`);
      alert(data.message);
      router.push(`/openings`);
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh openings
    mutate(`/api/openings`);
  };

  return (
    <div>
      <div className="mx-auto max-w-4xl pt-20 flex flex-col justify-center items-center ">
        <div className="m-4  flex flex-wrap max-w-full"></div>
        {isEditing && (
          <div className="max-w-xl my-2 mx-auto">
            <label
              htmlFor="newName"
              className="block text-sm font-medium text-gray-700"
            >
              Change name{" "}
              {!newName ||
                (newName === opening.GSI1SK && (
                  <span className="text-sm text-blue-gray-500">
                    - Name will stay the same
                  </span>
                ))}
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
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
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
        )}
      </div>
    </div>
  );
}
