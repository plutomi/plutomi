import { useSelf } from '../../SWR/useSelf';
import { useUserInvites } from '../../SWR/useUserInvites';
import { DynamoOrgInvite } from '../../types/dynamo';
import { Invite } from '../Invite/Invite';
import { Loader } from '../Loader/Loader';

export const InvitesPageContent = () => {
  const { user, isUserLoading, isUserError } = useSelf();
  // TODO we don't have to make this call here if a user doesn't have invites
  const { invites, isInvitesLoading, isInvitesError } = useUserInvites({
    userId: user?.userId,
  });

  if (isInvitesError) {
    return <h1>An error ocurred returning your invites</h1>;
  }
  if (isInvitesLoading) return <Loader text="Loading invites..." />;

  if (!invites?.length) return <h1>You don&apos;t have any invites :(</h1>;

  return (
    <div className="">
      <ul className="divide-y divide-gray-200 mx-auto max-w-xl flex-col space-y-4 p-20  ">
        {invites?.map((invite: DynamoOrgInvite) => (
          <Invite invite={invite} key={invite.inviteId} />
        ))}
      </ul>
    </div>
  );
};
