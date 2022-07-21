import { mutate } from 'swr';
import { DynamoOrgInvite } from '../../types/dynamo';
import * as Time from '../../utils/time';
import * as Invites from '../../adapters/Invites';
import { useSelf } from '../../SWR/useSelf';

interface PendingInviteCardProps {
  invite: DynamoOrgInvite;
}

export const PendingInviteCard = ({ invite }: PendingInviteCardProps) => {
  const { user, isUserLoading, isUserError } = useSelf();

  const cancelInvite = async (invite: DynamoOrgInvite) => {
    try {
      const data = await Invites.CancelInvite({
        inviteId: invite.inviteId,
        orgId: user?.orgId,
        userId: invite.recipient.userId,
      });
      alert(data.data.message);
    } catch (error) {
      alert(error.response.message);
    }

    // Refresh the pending invites
    mutate(Invites.GetOrgInvitesURL(user?.orgId));
  };
  const { firstName, lastName, email } = invite.recipient;
  return (
    <div className="flex border rounded-lg shadow-sm  max-w-lg mx-auto my-4 ">
      <div className=" w-5/6  ">
        <div className="bg-blue-500 py-1 rounded-tl-lg">
          <h1 className="text-center text-md text-white font-semibold">
            Sent {Time.relative(invite.createdAt)}
          </h1>
        </div>

        <div className="flex flex-col text-left space-y-1 p-4">
          <h1 className="font-semibold text-md">
            {firstName} {lastName}
          </h1>

          <p className="text-md">{email}</p>
          <div className=" flex justify-between  items-center">
            {' '}
            <p className="text-sm text-blue-gray-400">
              Created by {invite.createdBy.firstName} {invite.createdBy.lastName}
            </p>
            <p className="text-sm text-blue-gray-400">Expires {Time.relative(invite.expiresAt)}</p>
          </div>
        </div>
      </div>
      <button
        type="submit"
        onClick={() => cancelInvite(invite)}
        className="w-1/6 border  rounded-lg rounded-l-none bg-white border-red-500  hover:bg-red-500  text-red-500 hover:text-white justify-center items-center flex transition ease-in duration-100 "
      >
        Cancel
      </button>
    </div>
  );
};
