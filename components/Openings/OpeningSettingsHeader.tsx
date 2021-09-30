import { useSession } from "next-auth/client";
import useOpenings from "../../SWR/useOpenings";
import useUser from "../../SWR/useUser";
import { PencilAltIcon, PlusIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
import useOpeningById from "../../SWR/useOpeningById";
import { useState } from "react";
import GoBack from "../Buttons/GoBackButton";
import { useRouter } from "next/router";
import Loader from "../Loader";
import StageModal from "../Stages/StageModal";
export default function OpeningSettingsHeader() {
  const router = useRouter();
  const { opening_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id as string
  );

  const stageModal = useStore((state: PlutomiState) => state.stageModal);
  const setStageModal = useStore((state: PlutomiState) => state.setStageModal);

  const openingModal = useStore((state: PlutomiState) => state.openingModal);
  const setOpeningModal = useStore(
    (state: PlutomiState) => state.setOpeningModal
  );

  if (isOpeningLoading) {
    return <Loader text={"Loading opening..."} />;
  }

  return (
    <div className="md:flex md:items-center md:justify-between ">
      <div className=" min-w-0 flex flex-col items-start ">
        <h2 className="text-2xl font-bold text-dark sm:text-3xl sm:truncate">
          {opening?.GSI1SK}
        </h2>
        <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800">
          <svg
            className="-ml-0.5 mr-1.5 h-2 w-2 text-indigo-400"
            fill="currentColor"
            viewBox="0 0 8 8"
          >
            <circle cx={4} cy={4} r={3} />
          </svg>
          {opening?.is_public ? "Public" : "Private"}
        </span>
      </div>

      <div className="space-x-4">
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
          className="inline-flex items-center px-4 py-2 border  shadow-sm text-base font-medium rounded-md border-blue-500 text-blue-500 bg-white hover:bg-blue-500 hover:text-white  transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PencilAltIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Edit Opening
        </button>
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
          className="inline-flex items-center px-4 py-2 border  shadow-sm text-base font-medium rounded-md border-blue-500 text-blue-500 bg-white hover:bg-blue-500 hover:text-white  transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Add Stage
        </button>
      </div>
    </div>
  );
}
