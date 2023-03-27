import { mutate } from 'swr';
import { Time } from '../../OLD/utils';
import * as Users from '../../OLD/.vscode/adapters/Users';
import { useSelf } from '../../OLD/SWR/useSelf';
import { useOrgInfo } from '../../OLD/SWR/useOrgInfo';
import { findInTargetArray } from '../../OLD/utils/findInTargetArray';
import { IndexableProperties } from '../../@types/indexableProperties';
import { UserEntity } from '../../models';
import { Loader } from '../Loader';

interface UserCardProps {
  user: UserEntity;
}
export const UserCard = ({ user }: UserCardProps) => {
  const { orgId } = user;
  const { org, isOrgLoading, isOrgError } = useOrgInfo({
    orgId,
  });

  // TODO error & loading handling
  const me = useSelf().user;
  const fullNameExists = user.firstName && user.lastName;

  const handleRemove = async (userBeingDeleted: UserEntity) => {
    const userEmail = findInTargetArray(IndexableProperties.Email, userBeingDeleted);
    const userText = fullNameExists
      ? `${userBeingDeleted.firstName} ${userBeingDeleted.lastName}`
      : userEmail;

    if (!confirm(`Are you sure you want to remove ${userText}?`)) {
      return;
    }
    try {
      const { data } = await Users.RemoveUserFromOrg({
        orgId,
        userId: userBeingDeleted.id,
      });
      console.log(data);
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh users
    mutate(Users.GetUsersInOrgURL());
  };

  if (isOrgError) return <h1>An error ocurred loading org info</h1>;
  if (isOrgLoading) return <Loader text="Loading org info..." />;

  console.log(`ORG user card`, org);
  const userEmail = findInTargetArray(IndexableProperties.Email, user);
  const createdById = findInTargetArray(IndexableProperties.CreatedBy, org);

  const isSelf = user.id === me.id;

  const isAdmin = createdById === me.id;
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

      {isAdmin && user.id !== me.id ? (
        <button
          type="submit"
          className="w-1/6 border  rounded-lg rounded-l-none bg-white border-red-500  hover:bg-red-500  text-red-500 hover:text-white  transition ease-in duration-100 "
          onClick={() => handleRemove(user)}
        >
          Remove
        </button>
      ) : null}
    </div>
  );
};