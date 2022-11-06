import { mutate } from 'swr';
import { Time } from '../../utils';
import * as Users from '../../adapters/Users';
import { useSelf } from '../../SWR/useSelf';
import { useOrgInfo } from '../../SWR/useOrgInfo';
import { findInTargetArray } from '../../utils/findInTargetArray';
import { IndexableProperties } from '../../@types/indexableProperties';
import { UserEntity } from '../../models';

interface UserCardProps {
  user: UserEntity;
}
export const UserCard = ({ user }: UserCardProps) => {
  console.log(`USER`, user);
  const orgId = findInTargetArray(IndexableProperties.Org, user);
  const { org, isOrgLoading, isOrgError } = useOrgInfo({
    orgId,
  });

  // TODO error & loading handling
  const me = useSelf().user;
  const myEmail = findInTargetArray(IndexableProperties.Email, user);

  const handleRemove = async (user: UserEntity) => {
    const userEmail = findInTargetArray(IndexableProperties.Email, user);

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
  const userEmail = findInTargetArray(IndexableProperties.Email, user);
  const isSelf = user.id === me.id;
  //  const createdById = findInTargetArray(IndexableProperties., org);

  const fullNameExists = user.firstName && user.lastName;
  return (
    <div className="border rounded-lg shadow-sm  max-w-lg mx-auto my-4 flex">
      <div className="flex flex-col text-left space-y-1 w-5/6 p-4">
        <h1 className="font-semibold text-md">
          {fullNameExists ? `${user.firstName} ${user.lastName}` : userEmail}
          {user?.firstName} {user?.lastName} {isSelf && ' - (YOU)'}
        </h1>
        {fullNameExists ? <p className="text-md">{userEmail}</p> : null}
        <p className="text-sm text-blue-gray-400">Joined {Time().to(user?.orgJoinDate)}</p>
      </div>
      {/* User is admin // TODO clean up */}
      {/* {me?.id === createdById && user?.id !== me?.id && (
        <button
          type="submit"
          className="w-1/6 border  rounded-lg rounded-l-none bg-white border-red-500  hover:bg-red-500  text-red-500 hover:text-white  transition ease-in duration-100 "
          onClick={() => handleRemove(user)}
        >
          Remove (TODO the check here is broken)
        </button>
      )} */}
    </div>
  );
};
