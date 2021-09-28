import { useSession } from "next-auth/client";
import useOpenings from "../../SWR/useOpenings";
import useUser from "../../SWR/useUser";
import { PlusIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
export default function OpeningsHeader() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { openings, isOpeningsLoading, isOpeningsError } = useOpenings(
    user?.user_id
  );
  const setCreateOpeningModalOpen = useStore(
    (state: PlutomiState) => state.setCreateOpeningModalOpen
  );

  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Openings
        </h2>
      </div>
      {/* An empty state will show if the user doesn't have openings*/}
      {openings.length > 0 ? (
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => setCreateOpeningModalOpen(true)}
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Opening
          </button>
        </div>
      ) : null}
    </div>
  );
}
