import axios from "../utils/axios";
// TODO types
const GetOrgInfoURL = () => `/orgs`;

const CreateOrg = async (displayName, orgId) => {
  const { data } = await axios.post(GetOrgInfoURL(), {
    orgId,
    displayName,
  });
  return data;
};

const GetOrgInfo = async () => {
  const { data } = await axios.get(GetOrgInfoURL());
  return data;
};

const DeleteOrg = async () => {
  const { data } = await axios.delete(GetOrgInfoURL());
  return data;
};

export { CreateOrg, GetOrgInfoURL, GetOrgInfo, DeleteOrg };
