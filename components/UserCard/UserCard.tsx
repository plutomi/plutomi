import { mutate } from 'swr';
import { DynamoUser } from '../../types/dynamo';
import * as Time from '../../utils/time';
import * as Users from '../../adapters/Users';
import { useSelf } from '../../SWR/useSelf';
import { useOrgInfo } from '../../SWR/useOrgInfo';
import { IndexedEntities } from '../../types/main';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { User, UserConstructorValues } from '../../entities';

interface UserCardProps {
  user: User;
}
export const UserCard = ({ user }: UserCardProps) => {
  const orgId = findInTargetArray({ entity: IndexedEntities.Org, targetArray: user.target });
  const { org, isOrgLoading, isOrgError } = useOrgInfo({
    orgId,
  });

  // TODO error & loading handling
  const me = useSelf().user;
  const handleRemove = async (user: User) => {
    const userEmail = findInTargetArray({
      entity: IndexedEntities.Email,
      targetArray: user.target,
    });

    if (
      !confirm(`Are you sure you want to remove ${user.firstName} ${user.lastName} - ${userEmail}?`)
    ) {
      return;
    }
    try {
      const { data } = await Users.RemoveUserFromOrg({
        orgId,
        userId: user.id,
      });
      console.log(data);
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh users
    mutate(Users.GetUsersInOrgURL());
  };

  const userEmail = findInTargetArray({ entity: IndexedEntities.Email, targetArray: user.target });
  const createdBy = findInTargetArray({
    entity: IndexedEntities.CreatedBy,
    targetArray: user.target,
  });
  return (
    <div className="border rounded-lg shadow-sm  max-w-lg mx-auto my-4 flex">
      <div className="flex flex-col text-left space-y-1 w-5/6 p-4">
        <h1 className="font-semibold text-md">
          {user?.firstName} {user?.lastName} {user.id === me.id && '- (YOU)'}
        </h1>
        <p className="text-md">{userEmail}</p>
        <p className="text-sm text-blue-gray-400">Joined {Time.relative(user?.orgJoinDate)}</p>
      </div>
      {/* User is admin // TODO clean up */}
      {me?.id === createdBy && user?.id !== me?.id && (
        <button
          type="submit"
          className="w-1/6 border  rounded-lg rounded-l-none bg-white border-red-500  hover:bg-red-500  text-red-500 hover:text-white  transition ease-in duration-100 "
          onClick={() => handleRemove(user)}
        >
          Remove (TODO the check here is broken)
        </button>
      )}
    </div>
  );
};
