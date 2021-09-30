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

  const { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    session?.user_id,
    opening_id as string
  );

  const { stage, isStageLoading, isStageError } = useStageById(
    user?.user_id,
    opening_id as string,
    stage_id as string
  );

  return <div></div>;
}
