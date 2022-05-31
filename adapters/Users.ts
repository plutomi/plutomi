import { AXIOS_INSTANCE as axios } from '../Config';
import { APIUpdateUserOptions } from '../Controllers/Users/updateUser';

const GetSelfInfoURL = () => `/users/self`;

const GetSelfInfo = async () => {
  const data = await axios.get(GetSelfInfoURL());
  return data;
};

const GetUserInfoUrl = (userId: string) => `/users/${userId}`;

const GetUserInfo = async (userId: string) => {
  const data = await axios.get(GetUserInfoUrl(userId));
  return data;
};

interface UpdateUserInput {
  userId: string;
  newValues: APIUpdateUserOptions;
}
const UpdateUser = async (options: UpdateUserInput) => {
  const data = await axios.put(GetUserInfoUrl(options.userId), {
    ...options.newValues,
  });
  return data;
};

const GetUsersInOrgURL = () => `/users`;

const GetUsersInOrg = async () => {
  const data = await axios.get(GetUsersInOrgURL());
  return data;
};

interface RemoveUserFromOrgInput {
  orgId: string;
  userId: string;
}
const GetRemoveUserFromOrgURL = (options: RemoveUserFromOrgInput) =>
  `/orgs/${options.orgId}/users/${options.userId}`;

const RemoveUserFromOrg = async (options: RemoveUserFromOrgInput) => {
  const data = await axios.delete(GetRemoveUserFromOrgURL({ ...options }));
  return data;
};
export {
  GetSelfInfo,
  GetSelfInfoURL,
  GetUserInfo,
  GetUserInfoUrl,
  UpdateUser,
  GetUsersInOrg,
  GetUsersInOrgURL,
  RemoveUserFromOrg,
};
