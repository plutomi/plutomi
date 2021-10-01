import { useSession } from "next-auth/client";
import useOpenings from "../../SWR/useOpenings";
import useUser from "../../SWR/useUser";
import { PlusIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
import { useState } from "react";
import useOrgUsers from "../../SWR/useOrgUsers";
import CreateInviteModal from "../CreateInviteModal";
import Loader from "../Loader";
export default function TeamHeader() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
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
