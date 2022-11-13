import { mutate } from 'swr';
import * as Invites from '../../adapters/Invites';
import { useSelf } from '../../SWR/useSelf';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { IndexableProperties } from '../../@types/indexableProperties';
import { Time } from '../../utils';
import { InviteEntity } from '../../models';

interface PendingInviteCardProps {
  invite: InviteEntity; // TODO types
}

export const PendingInviteCard = ({ invite }: PendingInviteCardProps) => {
  const { user, isUserLoading, isUserError } = useSelf();
  const { orgId } = user;

  const cancelInvite = async (invite: InviteEntity) => {
    try {
      const data = await Invites.CancelInvite({
        inviteId: invite.id,
        orgId,
      });
      console.log(`DATA`, data);
      alert(data.data.message);
    } catch (error) {
      alert(error.response.message);
    }

    // Refresh the pending invites
    mutate(Invites.GetOrgInvitesURL(orgId));
  };

  const { recipientName, createdBy } = invite;
  const recipientEmail = findInTargetArray(IndexableProperties.Email, invite);
  return (
    <div className="flex border rounded-lg shadow-sm  max-w-lg mx-auto my-4 ">
      <div className=" w-5/6  ">
        <div className="bg-blue-500 py-1 rounded-tl-lg">
          <h1 className="text-center text-md text-white font-semibold">
            Sent {Time().to(invite.createdAt)}
          </h1>
        </div>

        <div className="flex flex-col text-left space-y-1 p-4">
          <h1 className="font-semibold text-md">{recipientName}</h1>

          <p className="text-md">{recipientEmail}</p>
          <div className=" flex justify-between  items-center">
            {' '}
            <p className="text-sm text-blue-gray-400">
              Sent by {createdBy.name ? createdBy.name : createdBy.email}
            </p>
            <p className="text-sm text-blue-gray-400">Expires {Time().to(invite.expiresAt)}</p>
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
