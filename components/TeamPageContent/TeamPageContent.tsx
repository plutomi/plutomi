import { PlusIcon } from '@heroicons/react/outline';
import { useSelf } from '../../SWR/useSelf';
import { useOrgUsers } from '../../SWR/useOrgUsers';
import useStore from '../../utils/store';
import { usePendingOrgInvites } from '../../SWR/usePendingOrgInvites';
import { DynamoOrgInvite } from '../../types/dynamo';
import { Loader } from '../Loader';
import { EmptyTeamContent } from '../EmptyTeamContent';
import { PendingInviteCard } from '../PendingInviteCard';
import { CreateInviteModal } from '../CreateInviteModal';
import { UserCard } from '../UserCard';
import { nameIsDefault } from '../../utils/compareStrings/nameIsDefault';

export const TeamPageContent = () => {
  const { user, isUserLoading, isUserError } = useSelf();
  const { orgUsers, isOrgUsersLoading, isOrgUsersError } = useOrgUsers({
    orgId: user?.orgId,
  });
  const openInviteModal = useStore((state) => state.openInviteModal);
  const { pendingOrgInvites, isPendingOrgInvitesLoading, isPendingOrgInvitesError } =
    usePendingOrgInvites({
      orgId: user?.orgId,
    });
  if (isOrgUsersError) return <h1>An error ocurred returning your orgs users</h1>;
  if (isPendingOrgInvitesError) return <h1>An error ocurred retrieving your pending invites</h1>;
  if (isOrgUsersLoading) return <Loader text="Loading team..." />;
  if (isPendingOrgInvitesLoading) return <h2>Loading pending invites</h2>;

  const dividerWithText = (text: string) => {
    return (
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white text-lg font-medium text-gray-900">{text}</span>
        </div>
      </div>
    );
  };

  const pendingInvites = (
    <ul className="divide-y divide-gray-200">
      {pendingOrgInvites.map((invite: DynamoOrgInvite) => (
        <PendingInviteCard key={invite.inviteId} invite={invite} />
      ))}
    </ul>
  );
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

          {pendingOrgInvites?.length > 0 && (
            <>
              {dividerWithText('Pending invites')}
              {pendingInvites}
              {dividerWithText('Team')}
            </>
          )}

          {orgUsers?.map((user) => (
            <UserCard key={user.userId} user={user} />
          ))}
        </div>
      ) : (
        <div>
          <EmptyTeamContent />

          {pendingOrgInvites?.length > 0 && (
            <div className=" mt-8 ">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-lg font-medium text-gray-900">
                    Pending Invites
                  </span>
                </div>
              </div>
            </div>
          )}
          {pendingInvites}
        </div>
      )}
    </>
  );
};
