import { DynamoUser } from "../../types/dynamo";
import * as Time from "../../utils/time";
// TODO this type should be limited to what info is actually available
export default function UserCard({ user }: { user: DynamoUser }) {
  return (
    <div className="border rounded-lg shadow-sm p-4 max-w-lg mx-auto my-4">
      <div className="flex flex-col text-left space-y-1">
        <h1 className="font-semibold text-md">
          {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-md">{user?.email}</p>
        <p className="text-sm text-blue-gray-400">
          Joined {Time.relative(user?.orgJoinDate)}
        </p>
      </div>
    </div>
  );
}
