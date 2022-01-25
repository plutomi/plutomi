import useSelf from "../../SWR/useSelf";
import useOrgUsers from "../../SWR/useOrgUsers";
import UserCard from "./UserCard";
import Loader from "../Loader";
import { PlusIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
import CreateInviteModal from "../CreateInviteModal";
import { useRouter } from "next/router";
import EmptyTeamState from "./EmptyTeamState";
export default function TeamContent() {
  const router = useRouter();
  const { user, isUserLoading, isUserError } = useSelf();
  const { orgUsers, isOrgUsersLoading, isOrgUsersError } = useOrgUsers(
    user?.orgId
  );

  const openInviteModal = useStore((state) => state.openInviteModal);
  isOrgUsersLoading && <Loader text="Loading team..." />;

  return (
    <>
      <CreateInviteModal />
      {orgUsers?.length > 1 ? (
        <div className="">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={openInviteModal}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Team member
            </button>
          </div>

          {orgUsers?.map((user) => (
            <UserCard key={user.userId} user={user} />
          ))}
        </div>
      ) : (
        <EmptyTeamState />
      )}
    </>
  );
}
