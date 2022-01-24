import { AXIOS_INSTANCE as axios } from "../Config";
// TODO types

interface CreateOpeningOptions {
  /**
   * The name of this opening such as `NYC` or `Software Engineer`
   */
  openingName: string;
}

const CreateOpening = async (options: CreateOpeningOptions) => {
  const { data } = await axios.post(`/openings`, { ...options });
  return data;
};

const GetOpeningInfoURL = (openingId: string) => `/openings/${openingId}`;

const GetOpeningInfo = async (openingId: string) => {
  const { data } = await axios.get(GetOpeningInfoURL(openingId));
  return data;
};

const GetAllOpeningsInOrgURL = () => `/openings`;

const GetAlOpeningsInOrg = async () => {
  const { data } = await axios.get(GetAllOpeningsInOrgURL());
  return data;
};

const DeleteOpening = async (openingId) => {
  const { data } = await axios.delete(GetOpeningInfoURL(openingId));
  return data;
};

const UpdateOpening = async (openingId, newValues) => {
  const { data } = await axios.put(GetOpeningInfoURL(openingId), newValues);
  return data;
};

export {
  CreateOpening,
  UpdateOpening,
  DeleteOpening,
  GetAlOpeningsInOrg,
  GetAllOpeningsInOrgURL,
  GetOpeningInfo,
  GetOpeningInfoURL,
};
