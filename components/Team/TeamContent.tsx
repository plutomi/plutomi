import useSelf from "../../SWR/useSelf";
import useOrgUsers from "../../SWR/useOrgUsers";
import UserCard from "./UserCard";
import Loader from "../Loader";
import { PlusIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
export default function OpeningsContent() {
  const { user, isUserLoading, isUserError } = useSelf();

  const { orgUsers, isOrgUsersLoading, isOrgUsersError } = useOrgUsers(
    user?.org_id,
    user?.user_id
  );

  const setCreateInviteModalOpen = useStore(
    (state: PlutomiState) => state.setCreateInviteModalOpen
  );

  if (isOrgUsersLoading) {
    return <Loader text="Loading team..." />;
  }
  return (
    <>
      {orgUsers?.map((user: DynamoUser) => (
        <UserCard key={user.user_id} user={user} />
      ))}
      <button
        type="button"
        onClick={() => setCreateInviteModalOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        Add Team member
      </button>
    </>
  );
}
