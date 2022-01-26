import { AXIOS_INSTANCE as axios } from "../Config";
import { APICreateOpeningOptions } from "../Controllers/Openings/create-opening";
import { APIUpdateOpeningOptions } from "../Controllers/Openings/update-opening";

const CreateOpening = async (options: APICreateOpeningOptions) => {
  const { data } = await axios.post(`/openings`, { ...options });
  return data;
};

const GetOpeningInfoURL = (openingId: string) => `/openings/${openingId}`;

const GetOpeningInfo = async (openingId: string) => {
  const { data } = await axios.get(GetOpeningInfoURL(openingId));
  return data;
};

const GetOpeningsInOrgURL = () => `/openings`;

const GetAlOpeningsInOrg = async () => {
  const { data } = await axios.get(GetOpeningsInOrgURL());
  return data;
};

const DeleteOpening = async (openingId) => {
  const { data } = await axios.delete(GetOpeningInfoURL(openingId));
  return data;
};

const UpdateOpening = async (
  openingId: string,
  options: APIUpdateOpeningOptions
) => {
  const { data } = await axios.put(GetOpeningInfoURL(openingId), {
    ...options,
  });
  return data;
};

export {
  CreateOpening,
  UpdateOpening,
  DeleteOpening,
  GetAlOpeningsInOrg,
  GetOpeningsInOrgURL,
  GetOpeningInfo,
  GetOpeningInfoURL,
};
