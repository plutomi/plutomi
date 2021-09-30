import { useSession } from "next-auth/client";
import useOpenings from "../../SWR/useOpenings";
import useUser from "../../SWR/useUser";
import { PlusIcon, TrashIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
import useOpeningById from "../../SWR/useOpeningById";
import { useState } from "react";
import { useRouter } from "next/router";
import Loader from "../Loader";
import useStageById from "../../SWR/useStageById";
export default function StageSettingsHeader({ deleteStage }) {
  const router = useRouter();
  const { opening_id, stage_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id as string
  );

  const { stage, isStageLoading, isStageError } = useStageById(
    user?.user_id,
    opening?.opening_id,
    stage_id as string
  );

  if (isOpeningLoading) {
    return <Loader text={"Loading opening..."} />;
  }
  if (isStageLoading) {
    return <Loader text={"Loading stage..."} />;
  }
  return (
    <div className="md:flex md:items-center md:justify-between ">
      <div className=" min-w-0 ">
        <h2 className="text-2xl font-bold leading-7 text-dark sm:text-3xl sm:truncate">
          {opening?.GSI1SK}
        </h2>
      </div>
      <div>
        <button
          type="button"
          onClick={() => deleteStage()}
          className="inline-flex items-center px-4 py-2 border  shadow-sm text-base font-medium rounded-md border-red-500 text-red-500 bg-white hover:bg-red-500 hover:text-white  transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <TrashIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Delete Stage
        </button>
      </div>
    </div>
  );
}
