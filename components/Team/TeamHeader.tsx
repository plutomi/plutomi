<<<<<<< HEAD
<<<<<<< HEAD
=======
import { useSession } from "next-auth/client";
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
=======
>>>>>>> 35ce39a (feat: Added ability to get all applicants by opening)
import useSelf from "../../SWR/useSelf";
import { PlusIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
import useOrgUsers from "../../SWR/useOrgUsers";

export default function TeamHeader() {
  const { user, isUserLoading, isUserError } = useSelf();
  const { orgUsers, isOrgUsersLoading, isOrgUsersError } = useOrgUsers(
    user?.org_id,
    user?.user_id
  );

  const setCreateInviteModalOpen = useStore(
    (state: PlutomiState) => state.setCreateInviteModalOpen
  );

  return (
    <div className="md:flex md:items-center md:justify-between ">
      <div className=" min-w-0 ">
        <h2 className="text-2xl font-bold leading-7 text-dark sm:text-3xl sm:truncate">
          Team
        </h2>
      </div>

      {/* An empty state with an action button will show if the user doesn't have any team members*/}
      {/* A user is a member of their own org, so unless they have someone else this wont show*/}
      {orgUsers?.length > 1 && (
        <div className="mt-4 flex md:mt-0 md:ml-4 ">
          <button
            onClick={() => setCreateInviteModalOpen(true)}
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Team member
          </button>
        </div>
      )}
    </div>
  );
}
