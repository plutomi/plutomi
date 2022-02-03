import { DynamoOrgInvite, DynamoUser } from "../../types/dynamo";
import * as Time from "../../utils/time";
export default function PendingInviteCard({
  invite,
}: {
  invite: DynamoOrgInvite;
}) {
  const { firstName, lastName, email } = invite.recipient;
  return (
    <div className="border border-t-4 border-t-orange-500  rounded-lg shadow-sm  max-w-lg mx-auto my-4">
      <div className="bg-orange-500 py-1">
        <h1 className="text-center text-md text-white font-bold">
          PENDING INVITE - Sent {Time.relative(invite.createdAt)}
        </h1>
      </div>

      <div className="flex flex-col text-left space-y-1 p-4">
        <h1 className="font-semibold text-md">
          {firstName} {lastName}
        </h1>

        <p className="text-md">{email}</p>
        <div className="flex justify-between  items-center">
          {" "}
          <p className="text-sm text-blue-gray-400">
            Created by {invite.createdBy.firstName} {invite.createdBy.lastName}
          </p>
          <p className="text-sm text-blue-gray-400">
            Expires in {Time.relative(invite.expiresAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
