import { AXIOS_INSTANCE as axios } from "../Config";
// TODO types

const CreateOpening = async (openingName) => {
  const { data } = await axios.post(`/openings`, { openingName });
  return data;
};

const GetOpeningInfoURL = (openingId) => `/openings/${openingId}`;

const GetOpeningInfo = async (openingId) => {
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
