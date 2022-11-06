import { AXIOS_INSTANCE as axios } from '../Config';
// TODO

export const GetSelfInfoURL = () => `/users/me`;

export const GetSelfInfo = async () => {
  const data = await axios.get(GetSelfInfoURL());
  return data;
};

export const GetUserInfoUrl = (userId: string) => `/users/${userId}`;

export const GetUserInfo = async (userId: string) => {
  const data = await axios.get(GetUserInfoUrl(userId));
  return data;
};

interface UpdateUserInput {
  userId: string;
  newValues: any; // TODO! Types
}
export const UpdateUser = async (options: UpdateUserInput) => {
  const data = await axios.put(GetUserInfoUrl(options.userId), {
    ...options.newValues,
  });
  return data;
};

export const GetUsersInOrgURL = () => `/users`;

export const GetUsersInOrg = async () => {
  const data = await axios.get(GetUsersInOrgURL());
  return data;
};

interface RemoveUserFromOrgInput {
  orgId: string;
  userId: string;
}
export const GetRemoveUserFromOrgURL = (options: RemoveUserFromOrgInput) =>
  `/orgs/${options.orgId}/users/${options.userId}`;

export const RemoveUserFromOrg = async (options: RemoveUserFromOrgInput) => {
  const data = await axios.delete(GetRemoveUserFromOrgURL({ ...options }));
  return data;
};
