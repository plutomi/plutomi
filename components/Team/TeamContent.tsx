import useSelf from "../../SWR/useSelf";
import useOrgUsers from "../../SWR/useOrgUsers";
import UserCard from "./UserCard";
import Loader from "../Loader";
import { PlusIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
import CreateInviteModal from "../CreateInviteModal";
import { useRouter } from "next/router";
import InvitesService from "../../adapters/InvitesService";
import EmptyTeamState from "./EmptyTeamState";
export default function TeamContent() {
  const router = useRouter();
  const { user, isUserLoading, isUserError } = useSelf();
  const { orgUsers, isOrgUsersLoading, isOrgUsersError } = useOrgUsers(
    user?.org_id
  );

  const setCreateInviteModalOpen = useStore(
    (state: PlutomiState) => state.setCreateInviteModalOpen
  );

  if (isOrgUsersLoading) {
    return <Loader text="Loading team..." />;
  }

  if (isOrgUsersError) {
    alert(
      // TODO this is not returning the error message from the API call due to the way SWR handles errors. Fix !
      `You must create an org or join one before adding or viewing team members. If you have pending invites, you can view them at ${process.env.WEBSITE_URL}/invites`
    );
    router.push(`${process.env.WEBSITE_URL}/dashboard`);
    return null;
  }

  const createInvite = async (recipient_email: string) => {
    try {
      // TODO add custom expiry - Defaults to 3 days
      const { message } = await InvitesService.createInvite({
        recipient_email: recipient_email,
      });
      alert(message);
      setCreateInviteModalOpen(false);
    } catch (error) {
      console.error(error);
      alert(error.response.data.message);
    }
  };

  return (
    <>
      <CreateInviteModal createInvite={createInvite} />

      {orgUsers?.length > 1 ? ( // Set to 1 because a user can be the only one person in the org.
        <div className="">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setCreateInviteModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Team member
            </button>
          </div>

          {orgUsers?.map((user: DynamoUser) => (
            <UserCard key={user.user_id} user={user} />
          ))}
        </div>
      ) : (
        <EmptyTeamState />
      )}
    </>
  );
}
