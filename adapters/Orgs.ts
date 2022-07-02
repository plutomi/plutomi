import { AXIOS_INSTANCE as axios } from '../Config';
import { APICreateOrgOptions } from '../Controllers/Orgs/createAndJoinOrg';

export const GetOrgInfoURL = () => `/orgs`;

export const CreateOrg = async (options: APICreateOrgOptions) => {
  const data = await axios.post(GetOrgInfoURL(), { ...options });
  return data;
};

export const GetOrgInfo = async () => {
  const data = await axios.get(GetOrgInfoURL());
  return data;
};

export const DeleteOrg = async () => {
  const data = await axios.delete(GetOrgInfoURL());
  return data;
};
