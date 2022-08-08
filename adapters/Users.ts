import { Schema } from 'mongoose';
import { AXIOS_INSTANCE as axios } from '../Config';
import { APIUpdateUserOptions } from '../Controllers/Users/updateUser';

export const GetSelfInfoURL = () => `/users/me`;

export const GetSelfInfo = async () => {
  const data = await axios.get(GetSelfInfoURL());
  return data;
};

export const GetUserInfoUrl = (userId: Schema.Types.ObjectId) => `/users/${userId}`;

export const GetUserInfo = async (userId: Schema.Types.ObjectId) => {
  const data = await axios.get(GetUserInfoUrl(userId));
  return data;
};

interface UpdateUserInput {
  _id: Schema.Types.ObjectId;
  newValues: APIUpdateUserOptions;
}
export const UpdateUser = async (options: UpdateUserInput) => {
  const data = await axios.put(GetUserInfoUrl(options._id)), {
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
