import { mutate } from 'swr';
import { DynamoUser } from '../../types/dynamo';
import * as Time from '../../utils/time';
import * as Users from '../../adapters/Users';
import { useSelf } from '../../SWR/useSelf';
import { useOrgInfo } from '../../SWR/useOrgInfo';

interface UserCardProps {
  user: DynamoUser;
}
export const UserCard = ({ user }: UserCardProps) => {
  const { isUserLoading, isUserError } = useSelf();
  const { org, isOrgLoading, isOrgError } = useOrgInfo({
    orgId: user?.orgId,
  });

  // TODO error & loading handling
  const me = useSelf().user;
  const handleRemove = async (user: DynamoUser) => {
    if (
      !confirm(
        `Are you sure you want to remove ${user.firstName} ${user.lastName} - ${user.email}?`,
      )
    ) {
      return;
    }
    try {
      const { data } = await Users.RemoveUserFromOrg({
        orgId: user.orgId,
        userId: user.userId,
      });
      console.log(data);
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh users
    mutate(Users.GetUsersInOrgURL());
  };
  return (
    <div className="border rounded-lg shadow-sm  max-w-lg mx-auto my-4 flex">
      <div className="flex flex-col text-left space-y-1 w-5/6 p-4">
        <h1 className="font-semibold text-md">
          {user?.firstName} {user?.lastName} {user.userId === me.userId && '- (YOU)'}
        </h1>
        <p className="text-md">{user?.email}</p>
        <p className="text-sm text-blue-gray-400">Joined {Time.relative(user?.orgJoinDate)}</p>
      </div>
      {/* User is admin // TODO clean up */}
      {me?.userId === org?.createdBy && user?.userId !== me?.userId && (
        <button
          type="submit"
          className="w-1/6 border  rounded-lg rounded-l-none bg-white border-red-500  hover:bg-red-500  text-red-500 hover:text-white  transition ease-in duration-100 "
          onClick={() => handleRemove(user)}
        >
          Remove
        </button>
      )}
    </div>
  );
};
