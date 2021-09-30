import { useSession } from "next-auth/client";
import useOpenings from "../../SWR/useOpenings";
import useUser from "../../SWR/useUser";
import { PlusIcon } from "@heroicons/react/outline";
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

  if (isOpeningLoading) {
    return <Loader text={"Loading opening..."} />;
  }

  return (
    <div className="md:flex md:items-center md:justify-between ">
      <div className=" min-w-0 flex flex-col items-start ">
        {/* If an opening has stages, this button should go to the stages. If not, go back to the openings main page */}
        <GoBack
          url={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings ${
            opening?.stage_order.length == 0
              ? ""
              : `/stages/${opening?.stage_order[0]}`
          }`}
        />
        <h2 className="text-2xl font-bold text-dark sm:text-3xl sm:truncate">
          {opening?.GSI1SK}
        </h2>

        {opening?.is_public ? (
          <p className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Public
          </p>
        ) : (
          <p className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-gray-100 text-blue-gray-800">
            Private
          </p>
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => setStageModal({ ...stageModal, is_modal_open: true })}
          className="inline-flex items-center px-4 py-2 border  shadow-sm text-base font-medium rounded-md border-blue-500 text-blue-500 bg-white hover:bg-blue-500 hover:text-white  transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Create Stage
        </button>
      </div>
    </div>
  );
}
