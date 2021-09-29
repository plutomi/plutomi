import SignedInNav from "../../../../components/Navbar/SignedInNav";
import useStageById from "../../../../SWR/useStageById";
import SignIn from "../../../../components/SignIn";
import useUser from "../../../../SWR/useUser";
import { useEffect } from "react";
import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";
import { mutate } from "swr";
import useStore from "../../../../utils/store";
import { useState } from "react";
import useOpeningById from "../../../../SWR/useOpeningById";
export default function Stage() {
  const router = useRouter();
  const { stage_id, opening_id } = router.query;
  const [newName, setNewName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  const setQuestionModalOpen = useStore(
    (state: PlutomiState) => state.setQuestionModalOpen
  );

  const { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    session?.user_id,
    opening_id as string
  );

  const { stage, isStageLoading, isStageError } = useStageById(
    user?.user_id,
    opening_id as string,
    stage_id as string
  );

  const updateStage = async (stage_id: string) => {
    try {
      const body = {
        updated_stage: {
          ...stage,
          GSI1SK: newName ? newName : opening.GSI1SK, // If not blank
        },
      };

      const { data } = await axios.put(
        `/api/openings/${opening_id}/stages/${stage_id}`,
        body
      );
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
    mutate(`/api/openings/${opening_id}/stages/${stage_id}`);
    setIsEditing(false);
    setNewName("");
  };

  const DeleteStage = async (stage_id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this stage? THIS IS IRREVERSABLE!!!"
      )
    )
      return;
    try {
      const { data } = await axios.delete(
        `/api/openings/${opening_id}/stages/${stage_id}`
      );
      alert(data.message);
      router.push(`/openings/${opening_id}/stages`);
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh the stage_order
    mutate(`/api/openings/${opening_id}`);

    // Refresh the stage list
    mutate(`/api/openings/${opening_id}/stages`);
  };

  return <div></div>;
}
