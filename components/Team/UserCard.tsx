import { getRelativeTime } from "../../utils/time";
export default function UserCard({ user }) {
  return (
    <div className="border rounded-lg shadow-sm p-4 max-w-lg mx-auto my-4">
      <div className="flex flex-col text-left space-y-1">
        <h1 className="font-semibold text-md">{user?.GSI1SK}</h1>
        <p className="text-md">{user?.userEmail}</p>
        <p className="text-sm text-blue-gray-400">
          Joined {GetRelativeTime(user?.orgJoinDate)}
        </p>
      </div>
    </div>
  );
}
