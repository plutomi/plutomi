import { useSession } from "next-auth/client";
import useUser from "../../SWR/useUser";
import { CogIcon, PlusIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
import { useState } from "react";
import Link from "next/dist/client/link";
import { AdjustmentsIcon } from "@heroicons/react/outline";
import OpeningsDropdown from "../Openings/DropDown";
import useOpeningById from "../../SWR/useOpeningById";
import { useRouter } from "next/router";
import useOpenings from "../../SWR/useOpenings";
import useAllStagesInOpening from "../../SWR/useAllStagesInOpening";
export default function StagesHeader() {
  const router = useRouter();
  const { opening_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    session?.user_id,
    opening_id as string
  );
  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    session?.user_id,
    opening_id as string
  );
  let { openings, isOpeningsLoading, isOpeningsError } = useOpenings(
    user?.user_id
  );

  const setStageModalOpen = useStore(
    (state: PlutomiState) => state.setStageModalOpen
  );

  return (
    <div className="md:flex md:items-center md:justify-between  ">
      <div className=" min-w-0 w-2/5 inline-flex justify-center items-center">
        {openings ? (
          <OpeningsDropdown
            openings={openings}
            index={openings?.indexOf(
              openings?.find((opening) => opening.opening_id === opening_id)
            )}
          />
        ) : (
          <h1>Loading...</h1>
        )}
        <Link
          href={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings/${opening_id}/settings`}
        >
          <CogIcon className="w-10 h-10 ml-6 hover:text-dark text-light cursor-pointer transition duration-300 ease-in-out" />
        </Link>
      </div>

      {/* An empty state with an action button will show if the user doesn't have stages*/}
      {stages?.length > 0 && (
        <div className="mt-4 flex md:mt-0 md:ml-4 ">
          <button
            onClick={() => setStageModalOpen(true)}
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Stage
          </button>
        </div>
      )}
    </div>
  );
}
