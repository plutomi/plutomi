import axios from "../utils/axios";
// TODO types

const CreateOpening = async (openingName) => {
  const { data } = await axios.post(`/openings`, openingName);
  return data;
};

const GetOpeningByIdURL = (openingId) => `/openings/${openingId}`;

const GetOpeningById = async (openingId) => {
  const { data } = await axios.get(GetOpeningByIdURL(openingId));
  return data;
};

const GetAllOpeningsInOrgURL = () => `/openings`;

const GetAlOpeningsInOrg = async () => {
  const { data } = await axios.get(GetAllOpeningsInOrgURL());
  return data;
};

const DeleteOpening = async (openingId) => {
  const { data } = await axios.delete(GetOpeningByIdURL(openingId));
  return data;
};

const UpdateOpening = async (openingId, newValues) => {
  const { data } = await axios.put(GetOpeningByIdURL(openingId), newValues);
  return data;
};

export {
  CreateOpening,
  UpdateOpening,
  DeleteOpening,
  GetAlOpeningsInOrg,
  GetAllOpeningsInOrgURL,
  GetOpeningById,
  GetOpeningByIdURL,
};
