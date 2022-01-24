import { AXIOS_INSTANCE as axios } from "../Config";
import { APIUpdateUserOptions } from "../Controllers/Users/update-user";
const GetSelfInfoURL = () => `/users/self`;

const GetSelfInfo = async () => {
  const { data } = await axios.get(GetSelfInfoURL());
  return data;
};

const GetUserInfoUrl = (userId) => `/users/${userId}`;

const GetUserInfo = async (userId) => {
  const { data } = await axios.get(GetUserInfoUrl(userId));
  return data;
};

const UpdateUser = async (userId: string, options: APIUpdateUserOptions) => {
  const { data } = await axios.put(GetUserInfoUrl(userId), { ...options });
  return data;
};

const GetAllUsersInOrgURL = () => `/users`;

const GetAllUsersInOrg = async () => {
  const { data } = await axios.get(GetAllUsersInOrgURL());
  return data;
};

export {
  GetSelfInfo,
  GetSelfInfoURL,
  GetUserInfo,
  GetUserInfoUrl,
  UpdateUser,
  GetAllUsersInOrg,
  GetAllUsersInOrgURL,
};
