import { AXIOS_INSTANCE as axios } from '../Config';
import { APICreateOrgOptions } from '../Controllers/Orgs/createAndJoinOrg';

const GetOrgInfoURL = () => `/orgs`;

const CreateOrg = async (options: APICreateOrgOptions) => {
  const data = await axios.post(GetOrgInfoURL(), { ...options });
  return data;
};

const GetOrgInfo = async () => {
  const data = await axios.get(GetOrgInfoURL());
  return data;
};

const DeleteOrg = async () => {
  const data = await axios.delete(GetOrgInfoURL());
  return data;
};

export { CreateOrg, GetOrgInfoURL, GetOrgInfo, DeleteOrg };
