import { AXIOS_INSTANCE as axios } from "../Config";
// TODO types
const GetOrgInfoURL = () => `/orgs`;

/**
 *
 */
interface CreateOrgInput {
  /**
   * What shows up on org invites, billing, etc. Can be changed
   */
  displayName: string;
  /**
   * The unique id used to identify this org. Also shows up in URLs for openings
   */
  orgId: string;
}

const CreateOrg = async (props: CreateOrgInput) => {
  const { data } = await axios.post(GetOrgInfoURL(), props);
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
