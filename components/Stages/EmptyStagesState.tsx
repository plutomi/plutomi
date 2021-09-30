import { PlusIcon } from "@heroicons/react/solid";
import { BriefcaseIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
import { useRouter } from "next/router";
import { useSession } from "next-auth/client";
import useUser from "../../SWR/useUser";
import useAllStagesInOpening from "../../SWR/useAllStagesInOpening";
export default function EmptyStagesState() {
  const router = useRouter();
  const { opening_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    session?.user_id,
    opening_id as string
  );

  const setStageModalOpen = useStore(
    (state: PlutomiState) => state.setStageModalOpen
  );
  return (
    <div className="text-center">
      <BriefcaseIcon className="mx-auto h-12 w-12 text-light" />
      <h3 className="mt-2 text-lg font-medium text-dark">
        You don&apos;t have any stages in this opening
      </h3>
      <p className="mt-1 text-lg text-normal">
        Get started by creating a new stage!
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setStageModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Stage
        </button>
      </div>
    </div>
  );
}
