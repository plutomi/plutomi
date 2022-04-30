import useSelf from '../../SWR/useSelf';
import Loader from '../Loader';
import Invite from './Invite';
import { mutate } from 'swr';
import { useRouter } from 'next/router';
import { AcceptInvite, RejectInvite, GetUserInvitesURL } from '../../adapters/Invites';
import useUserInvites from '../../SWR/useUserInvites';
import { DynamoOrgInvite } from '../../types/dynamo';
import { GetSelfInfoURL } from '../../adapters/Users';
export default function InvitesContent() {
  const router = useRouter();
  const { user, isUserLoading, isUserError } = useSelf();
  // TODO we don't have to make this call here if a user doesn't have invites
  const { invites, isInvitesLoading, isInvitesError } = useUserInvites(user?.userId);

  if (isInvitesLoading) {
    return <Loader text="Loading invites..." />;
  }

  if (invites?.length === 0) {
    return <h1>You don&apos;t have any invites :(</h1>;
  }
  return (
    <div className="">
      <ul
        role="list"
        className="divide-y divide-gray-200 mx-auto max-w-xl flex-col space-y-4 p-20  "
      >
        {invites?.map((invite: DynamoOrgInvite) => (
          <Invite invite={invite} key={invite.inviteId} />
        ))}
      </ul>
    </div>
  );
}
